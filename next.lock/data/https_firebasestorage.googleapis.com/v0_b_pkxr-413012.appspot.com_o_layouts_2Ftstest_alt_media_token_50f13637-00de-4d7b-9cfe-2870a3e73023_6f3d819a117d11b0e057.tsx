import React, { useState, useRef, useEffect } from "react";
  import * as THREE from "three";
  import PKCanvas, { PKRootLayer, PKLayer, PKLink } from "@/components/PKCanvas";
  
  function Scene({ ...props }) {
    return (
      <mesh position={[0, 1.5, -1]}>
        <WhatsAppExample />
      </mesh>
    );
  }
  
  export default function Prototype() {
    return (
      <PKCanvas>
        <Scene />
      </PKCanvas>
    );
  }
  
  function WhatsAppExample({ ...props }) {
    const variants = {
      "310:239489": {
        variantIndex: 0,
        imageUrl:
          "/uploads/layouts/fa1e29a064914eac8b858600e656f703/WhatsAppExample_WhatsAppExample_0.png",
        id: "310:239489",
        x: 0,
        y: 0,
        width: 1016,
        height: 728,
      },
      "310:237884": {
        variantIndex: 1,
        imageUrl:
          "/uploads/layouts/fa1e29a064914eac8b858600e656f703/WhatsAppExample_WhatsAppExample_1.png",
        id: "310:237884",
        x: 0,
        y: 0,
        width: 1016,
        height: 728,
      },
    };
    const [variant, setVariant] = useState("310:239489");
    return (
      <>
        <PKLayer
          name={"WhatsAppExample"}
          width={1016}
          height={728}
          rootWidth={1016}
          rootHeight={728}
          {...variants[variant]}
          {...props}
        />
        {variant == "310:239489" && (
          <PKLink
            onClick={() => {
              if (Object.keys(variants).indexOf("310:237884") > -1) {
                setVariant("310:237884");
              } else {
                console.log("variant doesn't exist");
              }
            }}
            name={"Conversation Row"}
            width={336}
            height={100}
            x={104}
            y={83}
            linkTo={"310:237884"}
            rootWidth={1016}
            rootHeight={728}
          />
        )}
  
        {variant == "310:237884" && (
          <PKLink
            onClick={() => {
              if (Object.keys(variants).indexOf("310:239489") > -1) {
                setVariant("310:239489");
              } else {
                console.log("variant doesn't exist");
              }
            }}
            name={"Conversation Row"}
            width={336}
            height={100}
            x={104}
            y={303}
            linkTo={"310:239489"}
            rootWidth={1016}
            rootHeight={728}
          />
        )}
      </>
    );
  }
  