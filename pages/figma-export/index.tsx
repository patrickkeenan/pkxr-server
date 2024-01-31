import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect, ComponentType } from "react";

function FigmaViewer() {
  const router = useRouter();
  const [DynamicComponent, setDynamicComponent] =
    useState<ComponentType | null>(null);
  const [error, setError] = useState<String | null>();

  useEffect(() => {
    const loadDynamicComponent = async () => {
      try {
        const component = await import(`./figma-viewer`);
        setDynamicComponent(() => dynamic(() => Promise.resolve(component)));
      } catch (err) {
        console.log(err);
        setError("Failed to load the component.");
      }
    };
    // if (prototype) {
    loadDynamicComponent();
    // }
  }, []);

  if (error) {
    return <div>{error}</div>;
  }
  if (!DynamicComponent) {
    return <div>Looking for prototype...</div>;
  }
  return <DynamicComponent />;
}
export default FigmaViewer;
