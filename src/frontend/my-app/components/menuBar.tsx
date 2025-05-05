import Home from "@/icons/home";
import Profile from "@/icons/profile";
import { Button, TouchableOpacity, View } from "react-native";


interface Props{
iconFocus?: 'HOME' | 'PROFILE'
navigation?: any;
}
const MenuBar = (props: Props) => {
    
return(

<View style={{position: "absolute",  zIndex: 50, justifyContent: "center", alignItems: "center", width: '100%', bottom: 0, backgroundColor: "white"}}>
<View style={{  flexDirection: "row", gap: 40, alignItems: "center", justifyContent: "center", paddingBottom: 30}}>
<TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
<Home isFocused={props.iconFocus == 'HOME'} width={90} height={90}/>
</TouchableOpacity>
<TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
<Profile isFocused={props.iconFocus == 'PROFILE'}  width={90} height={90}/>
</TouchableOpacity>
</View>
</View>
) 
}
export default MenuBar;
