import React from "react";
import * as THREE from "three";
// import { RootContainer, Image, Text, Container } from "@coconut-xr/koestlich";
// import { makeBorderMaterial } from "@coconut-xr/xmaterials";
import fs from "fs";
import path from "path";
import template from "lodash.template";

const BASE_IMAGE_URL = "/uploads/images/";

export async function figmaToComponents(layoutObject) {
  writeTemplateToFile(
    "rootLayer",
    layoutObject,
    0,
    0,
    `prototypes/${layoutObject.id}`,
    `index.tsx`
  );
  createChildComponents(layoutObject, layoutObject, 0, 0);
}
async function createChildComponents(layer, layoutObject, depth, index) {
  writeTemplateToFile(
    "childLayer",
    layer,
    depth,
    index,
    `prototypes/${layoutObject.id}`,
    `${layer.componentName}.tsx`
  );
  let i = 0;
  for (let childKey in layer.children) {
    createChildComponents(layer.children[childKey], layoutObject, depth + 1, i);
    i++;
  }
}

async function writeTemplateToFile(
  templateName,
  layer,
  depth,
  index,
  dirPath,
  fileName
) {
  console.log("reading file", `components/templates/${templateName}.template`);
  // Read the template file
  const layerContent = await fs.readFile(
    `components/templates/${templateName}.template`,
    "utf8",
    (err, data) => {
      if (err) console.log(err);
      // cb(null, data);
    }
  );
  console.log("read file", `components/templates/${templateName}.template`);

  // // Create a template function
  const layerTemplate = template(layerContent);
  const layerComponent = layerTemplate({
    layer: layer,
    depth,
    index,
    renderChildImports: (layer) => {
      let string = "";
      for (let childLayerIndex in layer.children) {
        const childLayer = layer.children[childLayerIndex];
        string += `import ${childLayer.componentName} from "./${childLayer.componentName}";\n`;
      }
      return string;
    },
    renderChildren: (layer) => {
      let string = "";
      for (let childLayerIndex in layer.children) {
        const childLayer = layer.children[childLayerIndex];
        string += `<${childLayer.componentName} />`;
      }
      return string;
    },
  });
  // // Write the output to a new file
  // const dirPath = `prototypes/${layer.componentName}`;
  // Create the directory if it doesn't exist
  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.writeFile(dirPath + "/" + fileName, layerComponent);
}

export function FigmaLayout({ layoutObject, ...props }) {
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
      backgroundColor={"#" + Math.floor(0xffffff * Math.random()).toString(16)}
      backgroundOpacity={0}
      borderColor={"#f00"}
      padding={10}
      material={material}
    >
      <Image
        url={BASE_IMAGE_URL + layer.imageName}
        width={layer.width}
        height={layer.height}
      />
      {layer.children.map((subLayer, i) =>
        createElements(subLayer, newDepth, index)
      )}
    </Container>
  );
}

export function uniqueId() {
  return Math.floor(Math.random() * Date.now()).toString();
}
