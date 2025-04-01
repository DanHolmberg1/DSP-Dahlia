import { View, Text, Image, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { Link } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Definiera typerna explicit
  const containerStyle: ViewStyle = {
    flex: 1,
    position: 'relative',
    backgroundColor: isDark ? '#121212' : '#f5f5f5',
  };

  const backgroundImageStyle: ImageStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.9,
    resizeMode: 'cover',
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.5)',
  };

  const titleStyle: TextStyle = {
    fontSize: 32,
    fontWeight: 'bold' as const, // TypeScript kräver specifika värden för fontWeight
    marginBottom: 50,
    color: isDark ? 'white' : 'black',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  };

  const buttonStyle: ViewStyle = {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#2563eb',
  };

  const secondaryButtonStyle: ViewStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    borderColor: '#2563eb',
    borderWidth: 1,
  };

  const buttonTextStyle: TextStyle = {
    fontWeight: 'bold' as const,
    fontSize: 16,
    color: 'white',
  };

  const secondaryButtonTextStyle: TextStyle = {
    ...buttonTextStyle,
    color: '#2563eb',
  };

  return (
    <View style={containerStyle}>
      {/* Bakgrundsbild */}
      <Image 
        source={require('../assets/walktalk-logo.png')} 
        style={backgroundImageStyle}
      />
      
      {/* Innehåll ovanpå bakgrunden */}
      <View style={contentStyle}>
        <Text style={titleStyle}>Walk&Talk</Text>
        
        <View style={{ width: '100%', maxWidth: 300 }}>
          <Link href="/auth/login" asChild>
            <View style={buttonStyle}>
              <Text style={buttonTextStyle}>Logga in</Text>
            </View>
          </Link>
          
          <Link href="/auth/register" asChild>
            <View style={secondaryButtonStyle}>
              <Text style={secondaryButtonTextStyle}>Registrera dig</Text>
            </View>
          </Link>
        </View>
      </View>
    </View>
  );
}