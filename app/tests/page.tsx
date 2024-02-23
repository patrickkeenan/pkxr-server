"use client";
import { MutableRefObject, Suspense, useState, useRef, useEffect } from "react";
import {
  XRCanvas,
  Hands,
  Controllers,
  GrabHand,
} from "@coconut-xr/natuerlich/defaults";
import * as THREE from "three";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { RootContainer, Container, Image } from "@coconut-xr/koestlich";

import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useInputSources,
  SessionModeGuard,
  useHeighestAvailableFrameRate,
  useNativeFramebufferScaling,
} from "@coconut-xr/natuerlich/react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  PositionalAudio,
  Environment,
  OrbitControls,
  Sphere,
} from "@react-three/drei";

import { useSpring, animated, a, useSpringValue } from "@react-spring/three";

import { MeshPhysicalMaterial } from "three";
extend({ MeshPhysicalMaterial });

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"],
};

function Scene({ pointerIsDown }) {
  const [scale, setScale] = useState(0.1);
  const [playing, setPlaying] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [variant, setVariant] = useState("sleep");
  const soundDownRef = useRef<THREE.PositionalAudio>(null);
  const soundUpRef = useRef<THREE.PositionalAudio>(null);
  const [timeoutId, setTimeoutId] = useState<any>(undefined);

  const subjectRef = useRef<THREE.Mesh | null>(null);
  const setTargetName = useLerpTowards(subjectRef, "head-front-1", 0.1);

  useEffect(() => {
    console.log(variant);
    if (variant == "sleep") {
      clearTimeout(timeoutId);
      popScale.start(0.01);
    } else if (variant == "pop-1") {
      popScale.start(0.09);
      setTimeoutId(
        setTimeout(() => {
          setVariant("pop-2");
        }, 1000)
      );
    } else if (variant == "pop-2") {
      popScale.start(0.12);
    }
    return () => clearTimeout(timeoutId);
  }, [variant]);

  const popScale = useSpringValue(0.04, {
    from: 0.04,
    to: 0.09,
    onStart: () => {
      // vector2.set(value.position[0], value.position[1])
      console.log("start");
    },
    onRest: () => {
      // vector2.set(value.position[0], value.position[1])
      console.log("rest", variant);
    },
  });

  useEffect(() => {
    if (pointerIsDown) {
      startPinch();
    } else {
      endPinch();
    }
  }, [pointerIsDown]);
  const startPinch = () => {
    {
      setIsPinching(true);
      setVariant("pop-1");
      setPlaying(true);
      setScale(0.09);
      // popScale.start(0.09);
      soundDownRef.current?.play();
      const id = setTimeout(() => {
        if (isPinching) {
          // popScale.start(2);
          // api.start({ scale: 2 });
        }
      }, 3000);
      // setTimeoutId(id);
    }
  };
  const showGlimpse = () => {
    setVariant("pop-2");
    setScale(1);
  };
  const endPinch = () => {
    {
      // clearTimeout(timeoutId);
      setVariant("sleep");
      setIsPinching(false);
      setScale(0.1);
      // popScale.start(0.1);
      soundUpRef.current?.play();
    }
  };

  return (
    <>
      <mesh position={[0, 1, -5]}>
        <PositionalAudio
          ref={soundDownRef}
          url="/sounds/Tab 3.m4a"
          distance={1}
          loop={false}
          // {...props} // All THREE.PositionalAudio props are valid
        />
        <PositionalAudio
          ref={soundUpRef}
          url="/sounds/Tab 2.m4a"
          distance={1}
          loop={false}
          // {...props} // All THREE.PositionalAudio props are valid
        />
      </mesh>

      <pointLight position={[-1, 2, -1]} intensity={3} />
      <mesh ref={subjectRef} position={[0, 1.5, -2]}>
        <animated.mesh
          // onClick={() => setScale((s) => s * 1.1)}
          // scale={scale}
          scale={popScale}
        >
          <sphereGeometry />
          <a.meshPhysicalMaterial
            color={isPinching ? "red" : "blue"}
            transparent={true}
          />
        </animated.mesh>
      </mesh>

      <RootContainer
        position={[0, 1, -3]}
        // ref={glassRef}
        pixelSize={0.002}
        // sizeX={320}
        precision={0.1}
        alignItems="center"
        justifyContent="center"
        overflow="visible"
      >
        <Container
          width={880}
          height={640}
          borderColor={"#fff"}
          borderOpacity={0.2}
          border={4}
          borderRadius={40}
        ></Container>
      </RootContainer>
    </>
  );

  // @ts-ignore
  // const AnimatedMeshPhysicalMaterial = animated(THREE.MeshPhysicalMaterial);
}

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const frameBufferScaling = useNativeFramebufferScaling();
  const heighestAvailableFramerate = useHeighestAvailableFrameRate();
  const [pointerIsDown, setPointerIsDown] = useState(false);

  const startPinch = () => {
    setPointerIsDown(true);
  };
  const endPinch = () => {
    setPointerIsDown(false);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button className={"button"} onClick={enterAR}>
        Enter AR
      </button>
      <XRCanvas
        dpr={devicePixelRatio}
        gl={{ localClippingEnabled: true, preserveDrawingBuffer: true }}
        frameBufferScaling={frameBufferScaling}
        frameRate={heighestAvailableFramerate}
        onPointerDown={() => startPinch()}
        onPointerUp={() => endPinch()}
      >
        <Scene pointerIsDown={pointerIsDown} />

        <ImmersiveSessionOrigin
          position={[0, 0, 0]}
          cameraContent={
            <>
              <Sphere
                position={[0, 0, 0]}
                onUpdate={(self) => {
                  self.userData.name = "head-front-0";
                }}
                scale={0.00001}
                material-color={"#f90"}
                material-transparent={true}
                material-opacity={0}
                material-side={THREE.DoubleSide}
              />
              <Sphere
                position={[0, 0, -1]}
                onUpdate={(self) => {
                  self.userData.name = "head-front-1";
                }}
                scale={0.00001}
                material-color={"#f90"}
                material-transparent={true}
                material-opacity={0}
                material-side={THREE.DoubleSide}
              />
              <Sphere
                onUpdate={(self) => {
                  self.userData.name = "head-sphere-2";
                }}
                scale={0.3}
                material-color={"#f90"}
                material-transparent={true}
                material-opacity={0}
                // material-side={THREE.DoubleSide}
              />
              <Sphere
                onUpdate={(self) => {
                  self.userData.name = "head-sphere-3";
                }}
                scale={0.4}
                material-color={"#f90"}
                material-transparent={true}
                material-opacity={0}
                // material-side={THREE.DoubleSide}
              />
              <Sphere
                onUpdate={(self) => {
                  self.userData.name = "head-sphere-4";
                }}
                scale={0.5}
                material-color={"#f90"}
                material-transparent={true}
                material-opacity={0}
                // material-side={THREE.DoubleSide}
              />
              <RootContainer
                position={[0, 1.5, -4.8]}
                // ref={glassRef}
                pixelSize={0.002}
                // sizeX={320}
                precision={0.1}
                alignItems="center"
                justifyContent="center"
                overflow="visible"
              >
                <Container
                  width={880}
                  height={640}
                  // borderColor={"#fff"}
                  // borderOpacity={0.2}
                  // border={4}
                  borderRadius={40}
                ></Container>
              </RootContainer>
            </>
          }
        >
          {inputSources.map((inputSource) => {
            if (
              inputSource.hand != null &&
              inputSource.handedness === "right"
            ) {
              return (
                <GrabHand
                  id={getInputSourceId(inputSource)}
                  key={getInputSourceId(inputSource)}
                  inputSource={inputSource}
                  hand={inputSource.hand}
                  onPointerDownMissed={() => {
                    startPinch();
                  }}
                  onPointerUpMissed={() => {
                    endPinch();
                  }}
                />
              );
            }
          })}
          {/* <GrabHand
            onPointerDownMissed={() => {
              setPlaying(true);
              setScale((s) => s * 0.9);
              soundDownRef.current.play();
            }}
            onPointerUpMissed={() => {
              setScale((s) => s * 1.2);
              soundUpRef.current.play();
            }}
          /> */}
        </ImmersiveSessionOrigin>

        {/* <NonImmersiveCamera position={[0, 1.5, 4]} /> */}
        <OrbitControls
          position={[0, 1.5, -3]}
          target={[0, 1.5, -1]}
          // camera={new THREE.PerspectiveCamera(45, 1, 1000)}
          makeDefault
        />
        <NonImmersiveCamera position={[0, 1.5, 0]}>
          <RootContainer
            position={[0, 0, -2.8]}
            // ref={glassRef}
            pixelSize={0.002}
            // sizeX={320}
            precision={0.1}
            alignItems="center"
            justifyContent="center"
            overflow="visible"
          >
            <Container
              width={880}
              height={640}
              borderColor={"#fff"}
              borderOpacity={0.2}
              border={4}
              borderRadius={40}
            ></Container>
          </RootContainer>
        </NonImmersiveCamera>
        <SessionModeGuard deny="immersive-ar">
          <Suspense>
            <Environment blur={0.05} files="/scenes/apartment.hdr" background />
          </Suspense>
        </SessionModeGuard>
      </XRCanvas>
    </div>
  );
}

function useLerpTowards(
  subjectRef: MutableRefObject<THREE.Mesh | null>,
  targetName: string,
  speed: number
) {
  const { scene } = useThree();
  const [_targetName, setTargetName] = useState(targetName);
  useFrame(({ gl, camera }) => {
    let target;
    scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object instanceof THREE.Mesh) {
        if (object.userData.name === _targetName) {
          target = object;
        }
      }
    });

    if (subjectRef.current && target) {
      // const targetPosition = target.getWorldPosition(new THREE.Vector3());
      // const targetPosition = target.position.clone();
      // const targetCameraPosition = camera.localToWorld(target.position.clone());
      // const resetPos = new THREE.Vector3(0, 0, 0);
      // const viewerPose = target.position.setFromMatrixPosition(
      //   camera.matrixWorld
      // );
      // console.log(target.position);
      // subjectRef.current.position.lerp(targetPosition, speed);
      // subjectRef.current.quaternion.slerp(camera.quaternion, speed);
      if (target.userData.name.indexOf("head-") == 0) {
        let centerPosition, centerQuaternion;
        let position = new THREE.Vector3(0, 0, 0);
        let rotation = new THREE.Quaternion();

        try {
          const frame = gl.xr.getFrame();
          //@ts-ignore
          const views = frame.getViewerPose(gl.xr.getReferenceSpace()).views;
          let leftMatrix = new THREE.Matrix4().fromArray(
            views[0].transform.matrix
          );
          let rightMatrix = new THREE.Matrix4().fromArray(
            views[1].transform.matrix
          );
          let leftPosition = new THREE.Vector3().setFromMatrixPosition(
            leftMatrix
          );
          let rightPosition = new THREE.Vector3().setFromMatrixPosition(
            rightMatrix
          );
          centerPosition = new THREE.Vector3()
            .addVectors(leftPosition, rightPosition)
            .multiplyScalar(0.5);

          // Get head rotation
          let leftQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            leftMatrix
          );
          let rightQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            rightMatrix
          );
          centerQuaternion = new THREE.Quaternion().slerpQuaternions(
            leftQuaternion,
            rightQuaternion,
            0.5
          );

          // const forward = new THREE.Vector3(0, 0, 1);
          // forward.applyQuaternion(centerQuaternion.quaternion);

          // Set the target position in front of the camera
          // const distanceInFrontOfCamera = 1;
          // centerPosition.add(forward.multiplyScalar(distanceInFrontOfCamera));

          position.copy(centerPosition);
          rotation.copy(centerQuaternion);
          position.add(
            target.position.clone().applyQuaternion(centerQuaternion)
          );
          subjectRef.current.position.lerp(position, speed);
          let newQuaternion = subjectRef.current.quaternion.slerp(
            rotation,
            speed
          );
          subjectRef.current.quaternion.copy(newQuaternion);
        } catch (e) {
          console.log(e);
        }
      } else {
        subjectRef.current.position.lerp(
          target.getWorldPosition(new THREE.Vector3()),
          speed
        );
        // let rightMatrix = new THREE.Matrix4().fromArray(
        //   target.transform.matrix
        // );
        // let rightQuaternion = new THREE.Quaternion().setFromRotationMatrix(
        //   rightMatrix
        // );
        let quat = target.getWorldQuaternion(new THREE.Quaternion());
        let rotation = new THREE.Quaternion();
        rotation = rotation.copy(quat);
        // rotation.copy(rightQuaternion);
        let newQuaternion = subjectRef.current.quaternion.slerp(
          rotation,
          speed
        );
        subjectRef.current.quaternion.copy(newQuaternion);
      }
    }
  });
  return setTargetName;
}
