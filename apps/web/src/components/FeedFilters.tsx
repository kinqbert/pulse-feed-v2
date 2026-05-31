import type { ButtonHTMLAttributes } from "react";
import { Box, Button, Flex, Select, Text } from "@radix-ui/themes";
import {
  defaultFeedFilters,
  getActivityLabel,
  useFeedFilterOptionsQuery,
  type ActivityType,
} from "../api/feed";
import { useFeedFiltersSearchParams } from "../hooks/useFeedFiltersSearchParams";

const typeOptions: Array<{ label: string; value: ActivityType | "all" }> = [
  { label: "All types", value: "all" },
  { label: getActivityLabel("comment"), value: "comment" },
  { label: getActivityLabel("mention"), value: "mention" },
  { label: getActivityLabel("task_update"), value: "task_update" },
  { label: getActivityLabel("deployment"), value: "deployment" },
];

const filterControlStyle = {
  flex: "1 1 0",
  minWidth: "150px",
};

const selectTriggerStyle = {
  width: "100%",
};

const dateInputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: "32px",
  padding: "0 8px",
  border: "1px solid var(--gray-7)",
  borderRadius: "var(--radius-2)",
  color: "var(--gray-12)",
  background: "var(--color-panel-solid)",
  font: "inherit",
  fontSize: "14px",
};

const presetButtonStyle = {
  padding: 0,
  border: 0,
  color: "var(--accent-11)",
  background: "transparent",
  font: "inherit",
  fontSize: "12px",
  cursor: "pointer",
};

const PresetButton = ({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    type="button"
    style={presetButtonStyle}
    onMouseEnter={(event) => {
      event.currentTarget.style.textDecoration = "underline";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.textDecoration = "none";
    }}
  >
    {children}
  </button>
);

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const daysSinceMonday = (start.getDay() + 6) % 7;

  start.setDate(start.getDate() - daysSinceMonday);

  return start;
}

export const FeedFilters = () => {
  const filterOptionsQuery = useFeedFilterOptionsQuery();
  const { filters, resetFilters, setActorId, setDateRange, setType } =
    useFeedFiltersSearchParams();
  const hasActiveFilters =
    filters.actorId !== defaultFeedFilters.actorId ||
    filters.from !== defaultFeedFilters.from ||
    filters.to !== defaultFeedFilters.to ||
    filters.type !== defaultFeedFilters.type;
  const applyDateRange = (from: Date, to: Date) => {
    setDateRange(formatDateInputValue(from), formatDateInputValue(to));
  };
  const applyToday = () => {
    const today = new Date();

    applyDateRange(today, today);
  };
  const applyThisWeek = () => {
    const today = new Date();
    const from = getStartOfWeek(today);
    const to = new Date(from);

    to.setDate(to.getDate() + 6);
    applyDateRange(from, to);
  };
  const applyLastWeek = () => {
    const to = getStartOfWeek(new Date());

    to.setDate(to.getDate() - 1);

    const from = new Date(to);

    from.setDate(from.getDate() - 6);
    applyDateRange(from, to);
  };
  const applyThisMonth = () => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    applyDateRange(from, to);
  };

  return (
    <Flex direction="column" gap="3" mt="4" width="100%">
      <Flex align="end" gap="3" wrap="wrap">
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
      </Flex>

      <Box>
        <Flex align="end" gap="3" wrap="wrap">
          <Box style={filterControlStyle}>
            <Text as="p" size="1" color="gray" mb="1">
              From
            </Text>
            <input
              aria-label="Start date"
              type="date"
              value={filters.from}
              onChange={(event) => setDateRange(event.target.value, filters.to)}
              style={dateInputStyle}
            />
          </Box>

          <Box style={filterControlStyle}>
            <Text as="p" size="1" color="gray" mb="1">
              To
            </Text>
            <input
              aria-label="End date"
              type="date"
              value={filters.to}
              onChange={(event) =>
                setDateRange(filters.from, event.target.value)
              }
              style={dateInputStyle}
            />
          </Box>
        </Flex>

        <Flex gap="2" wrap="wrap" mt="2" align="center">
          <PresetButton onClick={applyToday}>Today</PresetButton>
          <PresetButton onClick={applyThisWeek}>This week</PresetButton>
          <PresetButton onClick={applyLastWeek}>Last week</PresetButton>
          <PresetButton onClick={applyThisMonth}>This month</PresetButton>
          <PresetButton
            disabled={!filters.from && !filters.to}
            onClick={() => setDateRange("", "")}
          >
            Clear dates
          </PresetButton>
          <Button
            type="button"
            size="1"
            variant="soft"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
            style={{ marginLeft: "auto" }}
          >
            Reset filters
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
