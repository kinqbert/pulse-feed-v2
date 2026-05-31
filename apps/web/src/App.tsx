import { useEffect } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
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
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="2"
        minHeight="100vh"
      >
        <Text color="red">Could not load user.</Text>
        <Button
          type="button"
          size="1"
          variant="soft"
          disabled={meQuery.isFetching}
          onClick={() => void meQuery.refetch()}
        >
          {meQuery.isFetching ? "Retrying..." : "Retry"}
        </Button>
      </Flex>
    );
  }

  if (!userId) {
    return <Text color="gray">Loading user...</Text>;
  }

  return <Feed />;
}

export default App;
