export function figmaLayoutString(layoutObject) {
  return `
    import React, { useState, useRef, useEffect } from "react";
    import * as THREE from "three";
    import {
      RootContainer,
      Image,
      Text,
      Container,
    } from "@coconut-xr/koestlich";
    import { makeBorderMaterial } from "@coconut-xr/xmaterials";
    import PKCanvas from "@/components/PKCanvas";
    
    function Scene() { 
      const material = makeBorderMaterial(THREE.MeshPhongMaterial, {
        specular: "#555",
        shininess: 100,
      });
    
      return (<mesh position={[0, 1.5, -1]}>
      <RootContainer
        pixelSize={0.0007}
        precision={0.1}
        alignItems="center"
        justifyContent="center"
        overflow="visible"
      >
        <Container
          width={${layoutObject.width}}
          height={${layoutObject.height}}
        >${layoutObject.children.map((layer, i) => {
          return createStringElements(layer, 0, i);
        })}</Container>
        </RootContainer>
      </mesh>);
    }
    
    export default function Prototype() {
      return (
        <PKCanvas>
          <Scene />
        </PKCanvas>
      );
    }`;
}

function createStringElements(layer, depth, index) {
  const newDepth = depth + 1;
  return `<Container
          key={"${layer.id}"}
          positionType="absolute"
          positionLeft={${layer.x}}
          positionTop={${layer.y}}
          width={${layer.width}}
          height={${layer.height}}
          translateZ={${(newDepth + index) * 10}}
          backgroundColor={"#" + Math.floor(0xffffff * Math.random()).toString(16)}
          backgroundOpacity={0}
          borderColor={"#f00"}
          padding={10}
          material={material}
        >
          <Image
            url={"/uploads/images/${layer.imageName}"}
            width={${layer.width}}
            height={${layer.height}}
          />${layer.children.map((subLayer, i) =>
            createStringElements(subLayer, newDepth, index)
          )}</Container>`;
}
