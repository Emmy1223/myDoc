import type { Metadata } from "next";
import BuilderClient from "@/components/builder/BuilderClient";

export const metadata: Metadata = {
  title: "Document Builder — myDoc",
};

export default function BuilderPage({
  searchParams,
}: {
  searchParams: { upload?: string };
}) {
  return <BuilderClient startUpload={searchParams.upload === "1"} />;
}
