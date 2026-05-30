import { Box, Button, Flex, Select, Text } from "@radix-ui/themes";
import {
  defaultFeedFilters,
  getActivityLabel,
  useFeedFilterOptionsQuery,
  type ActivityType,
  type FeedPeriod,
} from "../api/feed";
import { useFeedFiltersSearchParams } from "../hooks/useFeedFiltersSearchParams";

const typeOptions: Array<{ label: string; value: ActivityType | "all" }> = [
  { label: "All types", value: "all" },
  { label: getActivityLabel("comment"), value: "comment" },
  { label: getActivityLabel("mention"), value: "mention" },
  { label: getActivityLabel("task_update"), value: "task_update" },
  { label: getActivityLabel("deployment"), value: "deployment" },
];

const periodOptions: Array<{ label: string; value: FeedPeriod }> = [
  { label: "All time", value: "all" },
  { label: "Past 24 hours", value: "24h" },
  { label: "Past 7 days", value: "7d" },
  { label: "Past 30 days", value: "30d" },
];

const filterControlStyle = {
  flex: "1 1 0",
  minWidth: "150px",
};

const selectTriggerStyle = {
  width: "100%",
};

export const FeedFilters = () => {
  const filterOptionsQuery = useFeedFilterOptionsQuery();
  const { filters, resetFilters, setActorId, setPeriod, setType } =
    useFeedFiltersSearchParams();
  const hasActiveFilters =
    filters.actorId !== defaultFeedFilters.actorId ||
    filters.period !== defaultFeedFilters.period ||
    filters.type !== defaultFeedFilters.type;

  return (
    <Flex align="end" gap="3" wrap="wrap" mt="4" width="100%">
      <Box style={filterControlStyle}>
        <Text as="p" size="1" color="gray" mb="1">
          Time period
        </Text>
        <Select.Root
          value={filters.period}
          onValueChange={(period) => setPeriod(period as FeedPeriod)}
        >
          <Select.Trigger style={selectTriggerStyle} />
          <Select.Content>
            {periodOptions.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box style={filterControlStyle}>
        <Text as="p" size="1" color="gray" mb="1">
          Actor
        </Text>
        <Select.Root value={filters.actorId} onValueChange={setActorId}>
          <Select.Trigger style={selectTriggerStyle} />
          <Select.Content>
            <Select.Item value="all">All actors</Select.Item>
            {filterOptionsQuery.data?.actors.map((actor) => (
              <Select.Item key={actor.id} value={actor.id}>
                {actor.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box style={filterControlStyle}>
        <Text as="p" size="1" color="gray" mb="1">
          Type
        </Text>
        <Select.Root
          value={filters.type}
          onValueChange={(type) => setType(type as ActivityType | "all")}
        >
          <Select.Trigger style={selectTriggerStyle} />
          <Select.Content>
            {typeOptions.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      <Button
        type="button"
        variant="soft"
        disabled={!hasActiveFilters}
        onClick={resetFilters}
        style={{ marginLeft: "auto" }}
      >
        Reset filters
      </Button>
    </Flex>
  );
};
