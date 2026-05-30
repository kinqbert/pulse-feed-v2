import { useEffect } from "react";
import { Text } from "@radix-ui/themes";
import { useMeQuery } from "./api/user";
import { Feed } from "./components/Feed";
import { useUserStore } from "./stores/useUserStore";

function App() {
  const meQuery = useMeQuery();
  const userId = useUserStore((state) => state.userId);
  const setUserId = useUserStore((state) => state.setUserId);

  useEffect(() => {
    if (meQuery.data) {
      setUserId(meQuery.data.id);
    }
  }, [meQuery.data, setUserId]);

  if (meQuery.isError) {
    return <Text color="red">Could not load user.</Text>;
  }

  if (!userId) {
    return <Text color="gray">Loading user...</Text>;
  }

  return <Feed />;
}

export default App;
