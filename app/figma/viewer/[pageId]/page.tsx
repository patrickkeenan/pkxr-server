"use client";
import { Suspense, useEffect, useState } from "react";
import Pusher from "pusher-js";
import * as PusherTypes from "pusher-js";
import * as THREE from "three";
import {
  Button,
  Glass,
  IconButton,
  TextInput,
  ActivityIndicator,
  ListItem,
  List,
} from "@coconut-xr/apfel-kruemel";
import { Grabbable } from "@coconut-xr/natuerlich/defaults";
import { RootContainer, Image, Text, Container } from "@coconut-xr/koestlich";
import { makeBorderMaterial } from "@coconut-xr/xmaterials";
import PKCanvas from "@/components/PKCanvas";
import { sendLayout } from "../../actions";
import sampleLayout from "@/public/uploads/layouts/layout.json";
import useSWR from "swr";
import axios from "axios";

export default function Page({ params }: { params: { pageId: string } }) {
  const fetcher = (url) => axios.get(url).then((res) => res.data);
  const {
    data: layoutData,
    error,
    isLoading,
  } = useSWR(`/uploads/layouts/${params.pageId}/layout.json`, fetcher, {
    refreshInterval: 1000,
  });

  useEffect(() => {
    console.log("got new layout", layoutData);
  }, [layoutData]);

  return (
    <>
      <h1>Viewer via sockets</h1>
      <PKCanvas>
        {/* <mesh position={[0, 1, -5]}>
          {content.map((Component, i) => {
            return <TestComponent imageUri={imageUri} key={i} />;
          })}
        </mesh> */}
        {layoutData && <FigmaLayout layoutObject={layoutData} />}
      </PKCanvas>
    </>
  );
}

export function FigmaLayout({ layoutObject, ...props }) {
  console.log("build", layoutObject);
  return (
    <mesh position={[0, 1.5, -1]}>
      <RootContainer
        // ref={glassRef}
        pixelSize={0.0007}
        // sizeX={320}
        precision={0.1}
        // alignItems="center"
        // justifyContent="center"
        // overflow="visible"
        // marginTop={variant == "desktop" ? -10 : 170}
        // marginLeft={variant == "desktop" ? 40 : 270}
      >
        <Container
          width={layoutObject.width}
          height={layoutObject.height}
          backgroundColor={"#aaa"}
          backgroundOpacity={0}
        >
          {layoutObject.children.map((layer, i) => {
            return createElements(layer, layoutObject, 0, i);
          })}
        </Container>
      </RootContainer>
      {/* <mesh scale={0.1}>
        <sphereGeometry />
        <meshPhysicalMaterial color="#f09" />
      </mesh> */}
    </mesh>
  );
}

export function createElements(layer, rootLayer, depth, index) {
  const newDepth = depth + 1;
  const material = makeBorderMaterial(THREE.MeshPhongMaterial, {
    specular: "#555",
    shininess: 100,
  });
  // layer.imageName ||
  const [imageUrl, setImageUrl] = useState("/placeholder.png");

  return (
    <Container
      key={layer.id}
      positionType="absolute"
      positionLeft={layer.x}
      positionTop={layer.y}
      minWidth={layer.width}
      width={layer.width}
      height={layer.height}
      translateZ={newDepth + index * 10}
      // backgroundColor={"#999"}
      backgroundOpacity={0}
      borderColor={"#f00"}
      // borderRadius={20}
      // padding={10}
      // material={material}
    >
      <Suspense>
        <Image
          url={
            // "/placeholder.png" ||
            `/uploads/layouts/${toSafeString(rootLayer.id)}/${layer.imageName}`
          }
          width={layer.width}
          height={layer.height}
        />
      </Suspense>
      {layer.children.map((subLayer, i) =>
        createElements(subLayer, rootLayer, newDepth, index)
      )}
    </Container>
  );
}

const toSafeString = (str) => str.replace(/[^\w\s]/gi, "");
