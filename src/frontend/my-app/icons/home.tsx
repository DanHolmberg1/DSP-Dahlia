import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  width: number;
  height: number;
  isFocused: boolean;
}

const Home: React.FC<Props> = ({ width, height, isFocused }) => {
  return (
    <View style={isFocused ? {borderRadius: "full", backgroundColor: "gray"} : null}>
      <Svg
        width={width}
        height={height}
        viewBox="0 -960 960 960"
        fill="black"
      >
        <Path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
      </Svg>
    </View>
  );
};

export default Home;