import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  width: number;
  height: number;
  angle: boolean;
}

const Arrow: React.FC<Props> = ({ width, height, angle }) => {
  return (
    <View style={{ transform: [{ rotate: angle ? "0deg" : "180deg" }] }}>
      <Svg
        width={width}
        height={height}
        viewBox="0 -960 960 960"
        fill="#e3e3e3"
      >
        <Path d="M480-180 180-480l42-42 258 258 258-258 42 42-300 300Z" />
      </Svg>
    </View>
  );
};

export default Arrow;