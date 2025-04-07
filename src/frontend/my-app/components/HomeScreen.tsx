import React from "react";
import { StyleSheet, View, Text, Button, TouchableOpacity, Alert } from "react-native";
import { socketService } from '@/socket/socketService';

interface HomeScreenProps {
    navigation: any;
    route?: {
        params?: {
            userId?: number;
        };
    };
}

const HomeScreen = (props: HomeScreenProps) => {
    const handleLogout = async () => {
        try {
            await socketService.logout();
            props.navigation.navigate('Login');
        } catch (err) {
            console.error('Logout failed:', err);
            Alert.alert('Error', 'Failed to logout');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>
                Welcome
            </Text>

            <View style={styles.buttonGroup}>
                <Button title="Map" onPress={() => props.navigation.navigate('Map')}/>
                <Button title="Book walk" onPress={() => props.navigation.navigate('Book walk')}/>
                <Button title="Find Walk Buddy" onPress={() => props.navigation.navigate('Walk Buddy')}/>
                <Button 
                    title="Profile" 
                    onPress={() => props.navigation.navigate('Profile', { 
                        userId: props.route?.params?.userId 
                    })}
                />
                <Button title="Socket test" onPress={() => props.navigation.navigate('SocketTest')}/>
            </View>

            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        justifyContent: 'space-between'
    },
    welcomeText: {
        fontSize: 24,
        color: "black",
        marginTop: 50,
        textAlign: 'center',
        marginBottom: 30
    },
    buttonGroup: {
        flex: 1,
        justifyContent: 'center',
        gap: 15
    },
    logoutButton: {
        backgroundColor: '#ff3b30',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default HomeScreen;