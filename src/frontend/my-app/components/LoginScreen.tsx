import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Button, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { socketService } from '@/socket/socketService';

interface LoginProps {
    navigation: any;
}

const LoginScreen = (props: LoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        // Basic validation
        if (!email || !password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        try {
            const result = await socketService.login({ email, password });
            
            if (result.success) {
                // Navigate to Home on successful login
                props.navigation.navigate("Home", { userId: result.userId });
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            > 
                <View style={styles.container}>
                    <Text style={styles.startText}>
                        Log in to your account
                    </Text>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <TextInput
                        style={styles.inputEmail}
                        placeholderTextColor="#888"
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.inputPassword}
                        placeholderTextColor="#888"
                        placeholder="Password"
                        secureTextEntry
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity 
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={styles.createAccountButton}
                        onPress={() => props.navigation.navigate("Create account")}
                    >
                        <Text style={styles.createAccountText}>Don't have an account? Create one</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}; 

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: "white",
        padding: 20,
    },
    startText: {
        fontSize: 24,
        color: "black",
        marginBottom: 30,
        marginTop: 85,
        textAlign: 'center',
    },
    inputEmail: {
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    inputPassword: {
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 25,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    createAccountButton: {
        alignItems: 'center',
    },
    createAccountText: {
        color: '#007AFF',
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 15,
    },
});

export default LoginScreen;