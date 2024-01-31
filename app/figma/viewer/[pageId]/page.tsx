"use client";
import PKCanvas, {
  PKRootLayer,
  PKNestedLayers,
  PKLayer,
} from "@/components/PKCanvas";
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

  return (
    <>
      <PKCanvas>
        {layoutData && (
          <>
            <PKNestedLayers layer={layoutData} rootLayer={layoutData} />
          </>
        )}
      </PKCanvas>
    </>
  );
}
