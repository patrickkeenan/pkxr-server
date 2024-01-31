import dynamic from "next/dynamic";
import React, { useState, useRef, useEffect } from "react";
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
import sampleLayout from "@/public/uploads/layouts/layout.json";
import Pusher from "pusher-js";
import * as PusherTypes from "pusher-js";

import PKCanvas from "@/components/PKCanvas";

// const pusher = new Pusher(process.env.PUSHER_APP_KEY as string, {
//   cluster: process.env.PUSHER_APP_CLUSTER as string,
// });

export default function Page() {
  const [clientId, setClientId] = useState<string | null>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setClientId(id);
    setLoaded(true);
  }, []);
  if (!loaded) {
    return <div>loading...</div>;
  }
  if (clientId) {
    return <ViewerView clientId={clientId} />;
  } else {
    return <ExporterView />;
  }
}

function ExporterView() {
  const [exportId, setExportId] = useState("");
  const [exportLink, setExportLink] = useState("");
  //   const [pusher, setPusher] = useState<Pusher | null>(null);
  //   const [channel, setChannel] = useState<PusherTypes.Channel | null>(null);

  useEffect(() => {
    // const pusher = new Pusher(
    //   process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
    //   {
    //     cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER as string,
    //   }
    // );
    // setPusher(pusher);
    // var chnl = pusher.subscribe("figma-123");
    // console.log("subscribed to", chnl, pusher);
    // chnl.bind("layout", function (data) {
    //   console.log(data);
    // });
    // setChannel(channel);
    // let uid;
    // let url = new URL(window.location.href);
    // let params = new URLSearchParams(url.search);
    // if (params.get("exportId")) {
    //   uid = params.get("exportId");
    // } else {
    //   uid = uniqueId();
    //   params.append("exportId", uid);
    //   url.search = params.toString();
    //   window.history.pushState({}, "", url.toString());
    // }

    setExportId(uid);
    setExportLink(`${window.location.href}?id=${uid}`);
  }, []);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const sendImage = () => {
    if (socket) {
      console.log("sending image as:", exportId);
      //   fetch("/api/testPush")
      //   socket.send(
      //     JSON.stringify({
      //       type: "sendImage",
      //       clientId: exportId,
      //       imageName: "Window_1702677151701",
      //       imageUri: imageUri,
      //     })
      //   );
    }
  };
  //   const sendLayout = () => {
  //     if (socket) {
  //       console.log("sending layout as:", exportId, sampleLayout);
  //       const jsonLayout = JSON.stringify(sampleLayout);

  //       //   socket.send(
  //       //     JSON.stringify({
  //       //       type: "sendLayout",
  //       //       clientId: exportId,
  //       //       layout: jsonLayout,
  //       //     })
  //       //   );
  //     }
  //   };
  return (
    <>
      <h1>Exporter via sockets</h1>
      <div>{exportId}</div>
      <span style={{ border: "10px #fff solid" }}>
        <img src={imageUri} style={{ width: 100, height: 100 }} />
      </span>
      <button onClick={sendImage}>Send Image</button>
      <button>Send Layout</button>
      <div>
        <a href={exportLink}>Link to Viewer</a>
      </div>
    </>
  );
}
const componentMapping = {
  Image: TestComponent,
};
function ViewerView({ clientId, ...props }) {
  const [imageUri, setImg] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [content, setContent] = useState([TestComponent]);
  const [layout, setLayout] = useState(null);
  useEffect(() => {
    // const ws = new WebSocket(`wss://${window.location.hostname}:8081`);
    // ws.onopen = function (event) {
    //   // Send the client ID to the server
    //   ws.send(
    //     JSON.stringify({
    //       type: "registerViewer",
    //       clientId: clientId,
    //     })
    //   );
    // };
    // ws.onmessage = function (event) {
    //   let message = JSON.parse(event.data);
    //   console.log("received:", message);
    //   if (message.type === "receiveImage") {
    //     // Display the image
    //     console.log("received image");
    //     setImg(message.imageUri);
    //   } else if (message.type === "receiveLayout") {
    //     // Display the image
    //     console.log("received layout", message.layout);
    //     setLayout(JSON.parse(message.layout));
    //     // setImg(message.imageUri);
    //   }
    // };
    // setSocket(ws);
  }, []);

  return (
    <>
      <PKCanvas>
        {/* <mesh position={[0, 1, -5]}>
          {content.map((Component, i) => {
            return <TestComponent imageUri={imageUri} key={i} />;
          })}
        </mesh> */}
        {layout && <FigmaLayout layoutObject={layout} />}
      </PKCanvas>

      <h1>Viewer for sockets</h1>
      <div>{clientId}</div>

      <img src={imageUri} style={{ width: 100, height: 100 }} />
    </>
  );
}

function TestComponent({ imageUri = "", ...props }) {
  return (
    <>
      <RootContainer
        // ref={glassRef}
        pixelSize={0.002 / 3}
        // sizeX={320}
        precision={0.01}
        // alignItems="center"
        // justifyContent="center"
        // overflow="visible"
        // marginTop={variant == "desktop" ? -10 : 170}
        // marginLeft={variant == "desktop" ? 40 : 270}
      >
        <Glass
          // width={1016}
          // height={728}
          // backgroundColor={"#aaa"}
          // backgroundOpacity={0}
          flexDirection="column"
          padding={24}
          gapRow={16}
          borderRadius={40}
          alignItems="center"
        >
          <Container width={600} height={600}>
            {imageUri != "" && <Image url={imageUri} />}
          </Container>
        </Glass>
      </RootContainer>
    </>
  );
}

function uniqueId() {
  return Math.floor(Math.random() * Date.now()).toString();
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
            return createElements(layer, 0, i);
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

export function createElements(layer, depth, index) {
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
      backgroundColor={"#999"}
      backgroundOpacity={0.8}
      borderColor={"#f00"}
      borderRadius={20}
      padding={10}
      material={material}
    >
      {imageUrl && (
        <Image url={imageUrl} width={layer.width} height={layer.height} />
      )}
      {layer.children.map((subLayer, i) =>
        createElements(subLayer, newDepth, index)
      )}
    </Container>
  );
}

const imageUri =
  "data:image/avif;base64,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";
