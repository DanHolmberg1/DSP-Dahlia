import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert, BackHandler } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoundTripRoutingAPI";
import polyline, { decode } from "polyline";
import { start } from "repl";
import { Pressable, ScrollView, TextInput } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker"; 
import { StatusBar } from "expo-status-bar";
import { abort } from "process";
import Arrow from "@/icons/arrow";
import MenuBar from "./menuBar";
import DateTimePicker from '@react-native-community/datetimepicker';
import { showRoute } from "./routeDetailScreen";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { sendGroupCreate } from "./requests/groups";
import { createRoute } from "./requests/routes"; 
import {USERID} from "./global/userID"

//OBS MOCK FUNCTION, remove later 
import { mockUser } from "./requests/mock";
import { getAuth } from "firebase/auth";
//OBS MOCK FUNCTION, remove later 

interface CreateWalkProps {
    navigation: any;
    route: any
}
const CreateWalk = (props: CreateWalkProps) => {

    // const auth = getAuth();
    // const userId = auth.currentUser;

    const navigation = useNavigation();

    useEffect(() => {
      const onBackPress = () => {
        navigation.navigate('Book walk' as never); 
        return true; 
      };
  
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      const beforeRemove = navigation.addListener('beforeRemove', (e) => {
        e.preventDefault(); 
        navigation.navigate('Book walk' as never);
      });
  
      return () => {
        backHandler.remove();
        beforeRemove();
      };
    }, [navigation]);

        const [selectedRoute, setSelectedRoute] = useState();
        const isFocused = useIsFocused();
        const [bookSpot, setbookSpot] = useState<boolean>(false);
        const [titleExpand, setTitleExpand] = useState(false);
        const [DesExpand, setDesExpand] = useState(false);
        const [TimeExpand, setTimeExpand] = useState(false);
        const [routeExpnad, setRouteExpnad] = useState(false);
        const pickerRef = useRef<Picker<string> | null>(null); 
        const [title, setTitle] = useState('');
        const [showTitle, setShowTitle] = useState(true);
        const [description, setDescription] = useState('');
        const [showInput, setShowInput] = useState(false);
        const [date, setDate] = useState(new Date());
        const [hasDate, setHasDate] = useState<boolean>(false);
        const [showCalender, setShowCalander] = useState(false);
        const [showTime, setShowTime] = useState(true);
        const [errorMessage, setErrorMessage] = useState<string>()

        useEffect(()=> {
            if(props.route.params?.selectedRoute) {
                setSelectedRoute(props.route.params.selectedRoute);
            }

            if(props.route.params?.walkData) {
                setTitle(props.route.params.walkData.title);
                setDescription(props.route.params.walkData.description);
                setDate( new Date(props.route.params.walkData.date));

            }

            if(props.route.params?.walkData.expandState) {
                const expandState = props.route.params?.walkData.expandState;
                setHasDate(expandState.hasDate);
                setShowInput(expandState.showInput);

            }
            //console.log("data",selectedRoute );
        },[props.route.params, isFocused]);

        useEffect(() => {
            if (selectedRoute) {
              console.log("Selected Route:", selectedRoute); 
            }
          }, [selectedRoute]); 


        const toggleMenuExpander = () => setTitleExpand(prev => !prev);
        const toggleDescExpander = () => setDesExpand(prev => !prev);
        const toggleCalenderExpander = () => setShowCalander(prev => !prev);
        const toggleRouteExpander = () => setRouteExpnad(prev => !prev);


        const handleCreateWalk = async () => {
            //Skicka data till databasen --> route och skapa nytt pass
            var canSendRequest = title.length > 0 && description.length > 0 && selectedRoute;
            //const userID = await mockUser(); 
            if(!canSendRequest) {
                alert("Besvara alla fält")
            } else if(USERID && selectedRoute){
                const routeID = await createRoute(USERID, selectedRoute);
                if(typeof routeID !== "number") {
                    alert("route undefined");
                } else {
                  console.log("hej hej hej");
                  const groupID = await sendGroupCreate(date, USERID, routeID, description, title, 10); 
                  console.log("Group ID: " + groupID); 
                  Alert.alert("Promenad skapad", "Du har nu skapat ett pass som andra kan gå med i!", [{ text: "OK" }]);

                }
            } else {
              alert("user id undefined");
            }
        }

    return (
     
<View style={{flex: 1}}>
    <ScrollView contentContainerStyle={{paddingBottom: 150, backgroundColor: "white", justifyContent: "flex-start", alignItems: "center", display: "flex", width: "100%", minHeight: "100%"}}>
            <View style={{width: "100%", alignItems: "center", justifyContent: "center",  borderBottomWidth: 1, height: "auto", padding: 20}}>
                    <View style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <Text style={styles.Titletext}>
                        {title ? "Titel: " + title : "Välj titel"}
                    </Text>
                    <Pressable style={{zIndex: 20, right: 20, backgroundColor: "white", position: "absolute"}}  onPress={toggleMenuExpander} >
        <Arrow width={36} height={36} angle={titleExpand}/>
        </Pressable>
        </View>
            <Picker
            ref = {pickerRef}
            selectedValue= {title}
            onValueChange={(titleVlaue)=> {
                setTitle(titleVlaue)
            }}
            style = {{width:'90%', backgroundColor: "#1B2D92",  borderRadius: 30, opacity: titleExpand ? 1 : 0, height: titleExpand ? 200 : 0}}
            mode="dropdown"
            >  
            <Picker.Item label='Familj pass' value ={'Familj pass'} />
            <Picker.Item label='Äldre' value ={'Äldre'} />
            <Picker.Item label='Studenter' value ={'Studenter'} />
            <Picker.Item label='Vuxna' value ={'Vuxna'} />
            <Picker.Item label='Kvinnor' value ={'kvinnor'} />
            <Picker.Item label='Män' value ={'Män'} />
            <Picker.Item label='Alla' value ={'Alla'} />
            <Picker.Item label='Husdjur' value ={'Husdjur'} />
            <Picker.Item label='Rullstoll' value ={'Rullstoll'} />
            <Picker.Item label='Spring' value ={'Spring'} />
            </Picker>
            </View>
            
            <View style={{width: "100%", alignItems: "center", justifyContent: "center", height: "auto", borderBottomWidth: 1, padding: 20}}>
                    <View style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <Text style={styles.Titletext}>
                        {description && showInput ? "Ändra beskrivning" : "Välj beskrivning"}
                    </Text>
                    <Pressable style={{zIndex: 20, right: 20, backgroundColor: "white", position: "absolute"}}  onPress={toggleDescExpander} >
    <Arrow width={36} height={36} angle={DesExpand}/>
    </Pressable>
    </View>

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        
    <View style={{ padding: 20, width:"100%", opacity: DesExpand ? 100 : 0, height: DesExpand ? 130 : 0}}>
            
          <Text >Beskrivning:</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              padding: 10,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            placeholder="Skriv din beskrivning här..."
            multiline
            maxLength={200}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setShowInput(false)}
            onBlur={() => setShowInput(true)} 
          />
          <Text style={{ marginTop: 4, color: '#999' }}>
            {description.length}/200
          </Text>

    </View>
  </TouchableWithoutFeedback>
  </View>
<View style={{width: "100%", alignItems: "center", justifyContent: "center", borderBottomWidth: 1, padding: 20}}>
<View style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
    <Text style={{fontSize: 20}}>
                {date && hasDate ? "Tid: "+ date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Välj tid"}  
                
    </Text>
    <Pressable style={{zIndex: 20, right: 20, backgroundColor: "white", position: "absolute"}}  onPress={toggleCalenderExpander} >
    <Arrow width={36} height={36} angle={showCalender}/>
    </Pressable>
</View>

  <DateTimePicker
  style = {{width:'50%',  borderRadius: 40,  marginLeft: 25, opacity: showCalender ? 100 : 0, height: showCalender ? 130 : 0, marginTop: showCalender ? 20 : -30, backgroundColor: "#1B2D92"}}

    value={date}
    mode="datetime" // 'time', 'datetime', "date"
    display="default"
    onChange={(event, selectedDate) => {
      //setShow(false);
      if (selectedDate) 
        setDate(selectedDate);
        setHasDate(true);
    }}
  />
  </View>

  <View style={{width: "100%", alignItems: "center", justifyContent: "center", borderBottomWidth: 1, padding: 10,
}}>
  <View style={{position: "relative", width: "100%", height: 40, justifyContent: "center", alignItems: "center",
}}>
    {/* Centered Title */}
    <Text style={styles.Titletext}>{selectedRoute ? "Ändra rutt" : "Välj rutt"}</Text>

    {/* Arrow Button on the right */}
    <Pressable
      onPress={toggleRouteExpander}
      style={{
        position: "absolute",
        right: 20,
        zIndex: 20,
        backgroundColor: "white",
      }}
    >
      <Arrow width={36} height={36} angle={routeExpnad} />
    </Pressable>
  </View>

  <View style={{ opacity: routeExpnad ? 1 : 0, height: routeExpnad ? 60 : 0, overflow: "hidden", marginTop: routeExpnad ? 10 : 0,
  }}>
    <TouchableOpacity style = {styles.RouteConatiner} onPress={() => props.navigation.navigate("Välj rutt", {walkData: {
        title: title,
        description: description,
        date : date.toISOString(),
        expandState: {
            hasDate,
            showInput,
        }
    }})}>
      <Text style={styles.Routetext}>Skapa din rutt</Text>
    </TouchableOpacity>
  </View>
</View>
<View style= {{ width: 500, height: 300 }}>
    <TouchableOpacity onPress={handleCreateWalk} style = {styles.CreareContainer} >
        <Text style = {{fontSize: 30, color: 'white'}}>
            Skapa promenad
        </Text>

    </TouchableOpacity>
</View>

<View> 
    {(title || description || date) && (
          <View style = {styles.bottomSummary}>
            {title ? (
              <Text >Titel: {title}</Text>
            ) : null}
            {description ? (
              <Text >Beskrivning: {description}</Text>
            ) : null}
            <Text>Datum: {date.toLocaleDateString()}</Text>
            <Text>Tid: {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          
        )} 
</View>
</ScrollView>
    <MenuBar navigation={props.navigation}/>
</View>
)}; export default CreateWalk;

const styles = StyleSheet.create({
    container: { flex: 1 },
    controls: {
        position: "absolute",
        bottom: 0,
        width:"100%",
        height:"30%",
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        padding: 20,
        justifyContent:"center",
        alignItems:"center",
    },
    titleConatiner: {
      width: "95%",
      marginBottom: -70,
      backgroundColor: '#F5BFA2',
      position: "absolute",
      bottom: 0,
      borderRadius: 40,
      borderColor: "black",
      color: "black",
      marginLeft: 10,
      marginTop: 0,
      padding: 15

    },
    bottomSummary: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#ccc',
        marginBottom: -500
      },

    desConatiner: {
        width: "95%",
        marginBottom: -180,
        backgroundColor: '#F5BFA2',
        position: "absolute",
        bottom: 0,
        borderRadius: 40,
        borderColor: "black",
        color: "black",
        marginLeft: 10,
        marginTop: 0,
        padding: 20
  
      },

      timeConatiner: {
        width: "95%",
        marginBottom: -290,
        backgroundColor: '#F5BFA2',
        position: "absolute",
        bottom: 0,
        borderRadius: 40,
        borderColor: "black",
        color: "black",
        marginLeft: 10,
        marginTop: 0,
        padding: 20
  
      },

      timetext : {
        fontSize: 30,
        marginLeft: 120,
        marginBottom: 4,
      },

      RouteConatiner: {
        width: "110%",
        height: "90%",
        paddingLeft: 30,
        paddingRight: 30,
        padding: 10,
        backgroundColor: "#1B2D92", 
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        borderRadius: 50,
        borderColor: "black",

      },

      CreareContainer: {
        width: "60%",
        height: "20%",
        //paddingLeft: 30,
        //paddingRight: 30,
        padding: 10,
        backgroundColor: "#E25E17", 
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        borderRadius: 50,
        borderColor: "black",
        marginTop: 200,
        marginLeft: 100,
        marginBottom: 200

      },
      

      Routetext : {
        fontSize: 30,
        color: "white",
  
      },
  
    generateContainer: {
        width: "70%",
        marginBottom: -260,
        backgroundColor: '#F5BFA2',
        position: "absolute",
        bottom: 0,
        borderRadius: 40,
        borderColor: "black",
        color: "black",
        marginLeft: 55,
        marginTop: 0,
        padding: 10
  
      },

      generateText: {
        fontSize: 30,
        marginLeft: 60,
        marginBottom: 4,
  
      },

    Titletext : {
      fontSize: 30,
    },

    Destext : {
        fontSize: 30,
        marginLeft: 35,
        marginBottom: 4,
  
      },

    AddSignContainer: {

    },
    BookContainer: {
        backgroundColor: 'rgb(5, 6, 58)',
        padding: 0, // Add some padding to make it look less cramped
        alignItems: 'center', // Center the text
        justifyContent: 'center',
        position: 'absolute', // Position it over the screen if needed
        top: 160, // Position it at the top or adjust based on your layout
        left: 15,
        right: 0,
        zIndex: 10, // Ensure it sits above other elements
        borderRadius: 20,
        width: 360,  // Adjust width
        height: 170, // Adjust height
        
    },
    StartText: {
        fontSize: 20,
        color:"black",
        marginBottom: 50,
        marginTop: 20,
        left: 10,
        fontFamily: 'inter',
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 8,
        backgroundColor: "white", // Set background color for the input field
        color: "black",
        width: "100%", // Make input take the full width
    },
    buttoncontainer: {
        width: "50%",
        marginBottom: 40,
        backgroundColor: 'white',
        position: "absolute",
        bottom: 0,
        borderRadius: 30,
        borderColor: "black",
        color: "black"
    },
    HeaderText: {
        fontSize: 32,
        color:'rgb(5, 6, 58)',
        marginBottom: 10,
        marginTop: 25,
        marginLeft: 25,
        fontFamily: 'inter',
        
    },
    OptionContainer: {
      flex: 1,
      backgroundColor: 'rgba(6, 18, 87, 0.8)',
      padding: 20,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      zIndex: 10,
      position: 'absolute', // Keeps it positioned relative to the screen
      top: 0,  // Move to the top instead of bottom
      width: '100%', 
      marginBottom: 0, // Remove margin to avoid gaps
    },

    FamilyWalkText: {
      fontSize: 22,
      color: "white",
      marginTop: 0,  // Remove any margin from the top
      marginBottom: 0,  // Remove margin at the bottom if you want to keep it tight
      textAlign: 'left',  // Align the text to the left
      fontFamily: 'inter',
    },
    
    buttoncontainerRoundTrip: {
      width: "40%",
      marginBottom: 30,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    buttoncontainerTripWithDes: {
      width: "60%",
      marginBottom: -20,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    buttoncontainerTripWithStops: {
      width: "60%",
      marginBottom: 30,
      marginLeft: 150,
      backgroundColor: 'white',
      position: "absolute",
      bottom: 0,
      borderRadius: 30,
      borderColor: "white",
      color: "black",
      left: -5,
    },
    
    OptionsMenu: {
      marginTop: 80, // Ensures buttons are not cut off
      width: "100%",
      alignItems: "center",
    },
    centerButtonContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: 150,
      zIndex: 10,
  },

});