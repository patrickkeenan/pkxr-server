import React from "react";
import * as THREE from "three";
// import { RootContainer, Image, Text, Container } from "@coconut-xr/koestlich";
// import { makeBorderMaterial } from "@coconut-xr/xmaterials";
import fs from "fs";
import prettier from "prettier";
import path from "path";
import template from "lodash.template";

const BASE_IMAGE_URL = "/uploads/images/";
let imageDir = ``;

const sampleLayout = {
  id: "fa1e29a0-6491-4eac-8b85-8600e656f703",
  layout: {
    RedDot: [
      {
        id: "327:473037",
        componentName: "RedDot",
        name: "RedDot",
        type: "ROOT",
        x: 0,
        y: 0,
        width: 307,
        height: 307,
        links: [],
        imageName: "RedDot.png",
        children: [],
      },
    ],
    WhatsAppExample: [
      {
        id: "310:239489",
        componentName: "WhatsAppExample",
        name: "WhatsAppExample",
        type: "ROOT",
        x: 0,
        y: 0,
        width: 1016,
        height: 728,
        links: [
          {
            id: "310:239576",
            componentName: "ConversationRow",
            name: "Conversation Row",
            type: "ACTION",
            x: 104,
            y: 83,
            width: 336,
            height: 100,
            children: [],
            links: [],
            color: "#f09",
            linkTo: "310:237884",
          },
        ],
        imageName: "WhatsAppExample.png",
        children: [
          {
            id: "310:239654",
            componentName: "Navigation",
            name: "navigation",
            type: "IMAGE",
            x: -0.000012414034245011862,
            y: 7.999997027625568,
            width: 68.00001241403425,
            height: 284.00000297237443,
            links: [],
            imageName: "Navigation.png",
            children: [],
          },
        ],
      },
      {
        id: "310:237884",
        componentName: "WhatsAppExample",
        name: "WhatsAppExample",
        type: "ROOT",
        x: 0,
        y: 0,
        width: 1016,
        height: 728,
        links: [
          {
            id: "310:237996",
            componentName: "ConversationRow",
            name: "Conversation Row",
            type: "ACTION",
            x: 104,
            y: 303,
            width: 336,
            height: 100,
            children: [],
            links: [],
            color: "#f09",
            linkTo: "310:239489",
          },
        ],
        imageName: "WhatsAppExample.png",
        children: [
          {
            id: "310:238049",
            componentName: "Navigation",
            name: "navigation",
            type: "IMAGE",
            x: -0.000012414034245011862,
            y: 7.999997027625568,
            width: 68.00001241403425,
            height: 284.00000297237443,
            links: [],
            imageName: "Navigation.png",
            children: [],
          },
        ],
      },
    ],
  },
};

let variantsbyComponent = {};
let linksbyComponent = {};

export async function figmaToComponents(doc) {
  console.log("writing templates with doc:", doc.id);
  const rootLayerId = toSafeString(doc.id);
  imageDir = `/uploads/layouts/${toSafeString(doc.id)}`;
  // Steps to render component file
  // 1/ Loop through componentNames
  // Render out dimensions
  // Render variants: each root layer ID is a variant
  // 2/ Render sub component definitions
  // Render sub component defintions
  // In the sub component loop through each variant and render it as an object, variant = layerId
  // 3/ Render the scene with subcomponents as children
  // Render each root component, there can be multiple
  // Set the variant to the first variant id
  // Each variant should flow down the components

  const sceneContent = await fs.promises.readFile(
    path.join(process.cwd(), "components/templates/Scene.template"),
    "utf8"
  );
  const sceneTemplate = template(sceneContent);

  // For rendering components in the root of the scene
  const rootComponentsContent = await fs.promises.readFile(
    path.join(process.cwd(), "components/templates/RootComponents.template"),
    "utf8"
  );
  const rootComponentsTemplate = template(rootComponentsContent);
  // Loop through components and build them out
  let rootComponentsString = "";
  // Find the variants and put them in a variable
  variantsbyComponent = {};
  Object.keys(doc.layout).forEach((componentName) => {
    console.log("name", rootComponentsTemplate({ componentName }));
    const componentVariants = doc.layout[componentName];
    const firstVariant = componentVariants[0];
    const rootComponentName = componentName;

    componentVariants.forEach((variant) => {
      const { props, children } = variant;

      const getVariantsForComponents = (layer, variantId) => {
        // omit properties that should not be in variants
        const {
          children,
          links,
          type,
          name,
          componentName,
          imageName,
          ...props
        } = layer;

        if (!linksbyComponent[layer.componentName]) {
          linksbyComponent[layer.componentName] = {};
        }
        linksbyComponent[layer.componentName][variantId] = links;

        if (!variantsbyComponent[layer.componentName]) {
          variantsbyComponent[layer.componentName] = {};
        }
        const variantIndex = Object.keys(
          variantsbyComponent[layer.componentName]
        ).length;
        variantsbyComponent[layer.componentName][variantId] = {
          variantIndex,
          imageUrl: `${imageDir}/${rootComponentName}_${layer.componentName}_${variantIndex}.png`,
          ...props,
        };
        children.forEach((subVariant) => {
          getVariantsForComponents(subVariant, variantId);
        });
      };
      getVariantsForComponents(variant, variant.id);
      // variantsbyComponent[variant.componentName][variant.id] = props;
      // children.forEach((subVariant) => {
      //   getVariantsForComponents(subVariant,variant.id)
      // })
    });
    console.log("got all variants", variantsbyComponent);

    // if (firstVariant.children.length > 0) {
    //   rootComponentsString += `<${componentName}>`;
    //   firstVariant.children.forEach((childLayer) => {
    //     console.log(
    //       " child name",
    //       rootComponentsTemplate({ componentName: childLayer.componentName })
    //     );
    //     rootComponentsString += `<${childLayer.componentName} />`;
    //     // rootComponentsString += rootComponentsTemplate({
    //     //   componentName: childLayer.componentName,
    //     // });
    //   });
    //   rootComponentsString += `</${componentName}>`;
    // } else {
    rootComponentsString += `<${componentName} />`;
    // }
  });
  console.log("made comps", rootComponentsString);
  // // Create a template function

  // For rendering definitions of components
  const componentDefintionContent = await fs.promises.readFile(
    path.join(
      process.cwd(),
      "components/templates/ComponentDefintion.template"
    ),
    "utf8"
  );
  const componentDefintionTemplate = template(componentDefintionContent);
  // Loop through components and build them out
  let componentDefinitionsString = "";
  Object.keys(doc.layout).forEach((componentName) => {
    console.log("name", componentName);
    // return componentDefintionTemplate({ componentName });
    // Use the first child to run through the sub layers
    const componentVariants = doc.layout[componentName];
    const firstVariant = componentVariants[0];
    console.log(
      "got defintions",
      renderComponentDefinitions(firstVariant, firstVariant)
    );
    componentDefinitionsString += renderComponentDefinitions(
      firstVariant,
      firstVariant
    );
  });

  console.log("made defs", componentDefinitionsString);

  const renderedPrototype = sceneTemplate({
    documentId: doc.id,
    layout: doc.layout,
    rootComponents: rootComponentsString,
    componentDefinitions: componentDefinitionsString,
    // renderChildImports: (layer) => {
    //   let string = "";
    //   for (let childLayerIndex in layer.children) {
    //     const childLayer = layer.children[childLayerIndex];
    //     string += `import ${childLayer.componentName} from "./${childLayer.componentName}";\n`;
    //   }
    //   return string;
    // },
    // renderChildren: (layer) => {
    //   let string = "";
    //   for (let childLayerIndex in layer.children) {
    //     const childLayer = layer.children[childLayerIndex];
    //     string += `<${childLayer.componentName} />`;
    //   }
    //   return string;
    // },
  });
  const formattedContent = await prettier.format(renderedPrototype, {
    parser: "typescript",
  });
  // // Write the output to a new file
  // const dirPath = `prototypes/${layer.componentName}`;
  // Create the directory if it doesn't exist
  const dirPath = `prototypes/${rootLayerId}`;
  const fileName = "index.tsx";
  console.log("writing TSX file", dirPath, fileName);
  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.writeFile(dirPath + "/" + fileName, formattedContent);

  // writeTemplateToFile("figmaLayer", `prototypes/${rootLayerId}`, `index.tsx`, {
  //   documentId: doc.id,
  //   layout: doc.layout,
  // });
}

function renderComponentDefinitions(layer, rootLayer) {
  if (layer.type == "ROOT") rootLayer = layer;

  const { children, ...layerInfo } = layer;
  const componentName = layer.componentName;
  const props = [
    "name",
    "width",
    "height",
    "x",
    "y",
    "z",
    "scaleX",
    "scaleY",
    "scaleZ",
    "rotationX",
    "rotationY",
    "rotationZ",
    "linkTo",
  ];
  const propValString = props
    .map((prop, i) => {
      if (layerInfo[prop])
        return `${prop}={${typeof layerInfo[prop] == "string" ? '"' + layerInfo[prop] + '"' : layerInfo[prop]}}`;
    })
    .join(" ");
  let layerString = `function ${componentName}({...props}){`;

  layerString += `const variants = ${JSON.stringify(variantsbyComponent[componentName])};`;
  layerString += `const [variant,setVariant] = useState("${layer.id}");`;

  layerString += `return (<><PKLayer ${propValString} rootWidth={${rootLayer.width}} rootHeight={${rootLayer.height}} {...variants[variant]} {...props}  />`;
  console.log("links", linksbyComponent[layer.componentName]);
  const variantLinks = linksbyComponent[layer.componentName];
  if (variantLinks) {
    Object.keys(variantLinks).forEach((variantId) => {
      const links = variantLinks[variantId];
      if (links.length < 1) return;
      layerString += `\n{variant == "${variantId}" && (`;
      links.forEach((link) => {
        const propValString = props
          .map((prop, i) => {
            if (link[prop])
              return `${prop}={${typeof link[prop] == "string" ? '"' + link[prop] + '"' : link[prop]}}`;
          })
          .join(" ");
        layerString += `<PKLink onClick={()=>{if(Object.keys(variants).indexOf("${link.linkTo}") > -1) {setVariant("${link.linkTo}")}else{console.log("variant doesn't exist")}}} ${propValString} rootWidth={${rootLayer.width}} rootHeight={${rootLayer.height}} />`;
      });
      layerString += `)}\n`;
    });
  }
  if (children.length > 0) {
    children.forEach((subLayer, i) => {
      layerString += `<${subLayer.componentName} variant={variant} />`;
    });
  }
  layerString += `</>)`;
  layerString += `}`;

  if (children.length > 0) {
    children.forEach((subLayer, i) => {
      layerString += renderComponentDefinitions(subLayer, rootLayer);
    });
  }

  return layerString;
}

async function createChildComponents(layer, rootLayer, depth, index) {
  const rootLayerId = toSafeString(layer.id);
  writeTemplateToFile(
    "childLayer",
    `prototypes/${rootLayerId}`,
    `${layer.componentName}.tsx`,
    {
      layer,
      rootLayer,
    }
  );
  let i = 0;
  for (let childKey in layer.children) {
    createChildComponents(layer.children[childKey], layer, depth + 1, i);
    i++;
  }
}

async function writeTemplateToFile(templateName, dirPath, fileName, props) {
  console.log("reading file", `components/templates/${templateName}.template`);

  // Read the template file
  const layerContent = await fs.promises.readFile(
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
  const renderedTemplate = layerTemplate({
    ...props,
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
  const formattedContent = await prettier.format(renderedTemplate, {
    parser: "typescript",
  });
  // // Write the output to a new file
  // const dirPath = `prototypes/${layer.componentName}`;
  // Create the directory if it doesn't exist
  console.log("writing TSX file", dirPath, fileName);
  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.writeFile(dirPath + "/" + fileName, formattedContent);
}

export function uniqueId() {
  return Math.floor(Math.random() * Date.now()).toString();
}
const toSafeString = (str) => str.replace(/[^\w\s]/gi, "");
