import React, { useState, useRef } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function TestMic() {
    const [inputText, setInputText] = useState('');
    const [recording, setRecording] = useState(null);
    const recordingRef = useRef(null);

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setRecording(recording);
        } catch (error) {
            Alert.alert('Error', 'Failed to start recording: ' + error.message);
        }
    };

    const stopRecording = async () => {
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                const uri = recordingRef.current.getURI();
                setRecording(null);
                await sendAudioToServer(uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to stop recording: ' + error.message);
        }
    };

    const sendAudioToServer = async (uri) => {
        try {
            const fileUri = uri;
            const fileType = 'audio/wav';

            const formData = new FormData();
            formData.append('audio', { uri: fileUri, name: 'recording.wav', type: fileType });

            const response = await fetch('http://192.168.0.5:5000/api/transcribe', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const result = await response.json();
            if (result.transcription) {
                setInputText(result.transcription);
            } else {
                Alert.alert('Error', result.error || 'Failed to transcribe audio.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send audio: ' + error.message);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput 
                value={inputText} 
                onChangeText={setInputText} 
                placeholder="Speak or type here..." 
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} 
            />
            <Button 
                title={recording ? 'Stop Recording' : 'Record'}
                onPress={recording ? stopRecording : startRecording} 
            />
        </View>
    );
}
