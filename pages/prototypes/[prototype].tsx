import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect, ComponentType } from "react";

function PrototypeHome() {
  const router = useRouter();
  const { prototype } = router.query;

  // Server side dynamic importing
  const [DynamicComponent, setDynamicComponent] =
    useState<ComponentType | null>(null);
  const [error, setError] = useState<String | null>();

  useEffect(() => {
    const loadDynamicComponent = async () => {
      try {
        const component = await import(
          `../../prototypes/${prototype}/index.tsx`
        );
        setDynamicComponent(() => dynamic(() => Promise.resolve(component)));
      } catch (err) {
        setError("Failed to load the component.");
      }
    };
    if (prototype) {
      loadDynamicComponent();
    }
  }, [prototype]);

  if (error) {
    return <div>{error}</div>;
  }
  if (!DynamicComponent) {
    return <div>Looking for prototype...</div>;
  }
  return <DynamicComponent />;
}
export default PrototypeHome;
