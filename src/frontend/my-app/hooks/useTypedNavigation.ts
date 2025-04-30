// src/hooks/useTypedNavigation.ts
import { 
    useNavigation,
    useRoute,
    RouteProp
  } from '@react-navigation/native';
  import { StackNavigationProp } from '@react-navigation/stack';
  import { RootStackParamList } from '@/types/navigation';
  
  export const useTypedNavigation = () => {
    return useNavigation<StackNavigationProp<RootStackParamList>>();
  };
  
  export const useTypedRoute = <T extends keyof RootStackParamList>() => {
    return useRoute<RouteProp<RootStackParamList, T>>();
  };