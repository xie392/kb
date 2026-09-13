import { PageSkeleton } from "@/components/skeletons";
import { ScrollResetOnMount } from "@/components/scroll-reset-on-mount";

export default function Loading() {
  return (
    <>
      <ScrollResetOnMount />
      <PageSkeleton />
    </>
  );
}
