import {
  AlertCircleIcon,
  BellIcon,
  CheckIcon,
  InfoIcon,
  PackageIcon,
  SearchIcon,
  TriangleAlertIcon,
  ZapIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { SectionHeader } from "@__APP_NAME__/ui/components/section-header";
import { StatusBadge } from "@__APP_NAME__/ui/components/status-badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@__APP_NAME__/ui/elements/alert";
import { Badge } from "@__APP_NAME__/ui/elements/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@__APP_NAME__/ui/elements/breadcrumb";
import { Button } from "@__APP_NAME__/ui/elements/button";
import { Checkbox } from "@__APP_NAME__/ui/elements/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@__APP_NAME__/ui/elements/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@__APP_NAME__/ui/elements/empty";
import { Input } from "@__APP_NAME__/ui/elements/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@__APP_NAME__/ui/elements/item";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@__APP_NAME__/ui/elements/pagination";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@__APP_NAME__/ui/elements/popover";
import { Progress } from "@__APP_NAME__/ui/elements/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "@__APP_NAME__/ui/elements/radio-group";
import { Skeleton } from "@__APP_NAME__/ui/elements/skeleton";
import { Spinner } from "@__APP_NAME__/ui/elements/spinner";
import { Switch } from "@__APP_NAME__/ui/elements/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@__APP_NAME__/ui/elements/tabs";
import { Textarea } from "@__APP_NAME__/ui/elements/textarea";
import { Toggle } from "@__APP_NAME__/ui/elements/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@__APP_NAME__/ui/elements/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@__APP_NAME__/ui/elements/tooltip";

function Subsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-title font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "ghost",
  "destructive",
  "spotlight",
  "link",
] as const;
const BUTTON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const STATUS_BADGE_VARIANTS = [
  { variant: "default" as const, label: "Default" },
  { variant: "primary" as const, label: "Primary" },
  { variant: "spotlight" as const, label: "Spotlight" },
  { variant: "success" as const, label: "Success" },
  { variant: "warning" as const, label: "Warning" },
  { variant: "destructive" as const, label: "Destructive" },
  { variant: "agent" as const, label: "Agent" },
  { variant: "info" as const, label: "Info" },
  { variant: "outline" as const, label: "Outline" },
];

const ALERT_VARIANTS = [
  {
    variant: "default" as const,
    icon: <InfoIcon strokeWidth={1.5} />,
    title: "Heads up",
    desc: "This is a default informational alert.",
  },
  {
    variant: "info" as const,
    icon: <InfoIcon strokeWidth={1.5} />,
    title: "Info",
    desc: "Your account settings have been updated.",
  },
  {
    variant: "warning" as const,
    icon: <TriangleAlertIcon strokeWidth={1.5} />,
    title: "Low stock warning",
    desc: "Flour is below minimum threshold — 3 kg remaining.",
  },
  {
    variant: "destructive" as const,
    icon: <AlertCircleIcon strokeWidth={1.5} />,
    title: "Action failed",
    desc: "Could not save changes. Please try again.",
  },
  {
    variant: "spotlight" as const,
    icon: <ZapIcon strokeWidth={1.5} />,
    title: "Agent needs attention",
    desc: "A proposal is waiting for your review.",
  },
];

export function ElementGallery() {
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("a");
  const [switchOn, setSwitchOn] = useState(false);
  const [toggleOn, setToggleOn] = useState(false);

  return (
    <section className="space-y-10">
      <SectionHeader
        kicker="ELEMENTS"
        title="Primitive gallery"
        description="Every primitive, every variant. Interactive triggers are live."
      />

      {/* Buttons */}
      <Subsection title="Buttons">
        <div className="space-y-4">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <div className="w-24 shrink-0 text-mono text-xs text-muted-foreground">
                {variant}
              </div>
              {BUTTON_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-24 shrink-0 text-mono text-xs text-muted-foreground">
              disabled
            </div>
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-24 shrink-0 text-mono text-xs text-muted-foreground">
              with icon
            </div>
            <Button>
              <PackageIcon strokeWidth={1.5} />
              Stock
            </Button>
            <Button variant="secondary">
              <SearchIcon strokeWidth={1.5} />
              Search
            </Button>
            <Button variant="ghost" size="icon">
              <BellIcon strokeWidth={1.5} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-24 shrink-0 text-mono text-xs text-muted-foreground">
              loading
            </div>
            <Button disabled>
              <Spinner className="size-3.5" />
              Saving…
            </Button>
          </div>
        </div>
      </Subsection>

      {/* Inputs */}
      <Subsection title="Inputs">
        <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              input — idle
            </div>
            <Input placeholder="Item name" />
          </div>
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              input — error
            </div>
            <Input
              placeholder="Item name"
              aria-invalid="true"
              defaultValue="bad val"
            />
          </div>
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              input — disabled
            </div>
            <Input placeholder="Disabled" disabled />
          </div>
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              textarea — idle
            </div>
            <Textarea placeholder="Write a note…" rows={3} />
          </div>
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              textarea — error
            </div>
            <Textarea
              placeholder="Write a note…"
              aria-invalid="true"
              defaultValue="invalid"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              textarea — disabled
            </div>
            <Textarea placeholder="Disabled" disabled rows={3} />
          </div>
        </div>
      </Subsection>

      {/* Checkbox / Radio / Switch / Toggle */}
      <Subsection title="Checkbox / Radio / Switch / Toggle">
        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <div className="mb-2 text-mono text-xs text-muted-foreground">
              Checkbox
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={false} readOnly />
              <span className="text-small text-muted-foreground">
                Unchecked
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={checked}
                onCheckedChange={(v) => setChecked(v === true)}
              />
              <span className="text-small text-foreground">
                Checked ({checked ? "on" : "off"})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked disabled />
              <span className="text-small text-muted-foreground">
                Checked + disabled
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="mb-2 text-mono text-xs text-muted-foreground">
              Radio
            </div>
            <RadioGroup value={radioValue} onValueChange={setRadioValue}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="radio-a" />
                <label htmlFor="radio-a" className="text-small text-foreground">
                  Option A
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="radio-b" />
                <label htmlFor="radio-b" className="text-small text-foreground">
                  Option B
                </label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <RadioGroupItem value="c" id="radio-c" disabled />
                <label
                  htmlFor="radio-c"
                  className="text-small text-muted-foreground"
                >
                  Disabled
                </label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <div className="mb-2 text-mono text-xs text-muted-foreground">
              Switch
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={false} readOnly />
              <span className="text-small text-muted-foreground">Off</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              <span className="text-small text-foreground">
                On ({switchOn ? "yes" : "no"})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked disabled />
              <span className="text-small text-muted-foreground">Disabled</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="mb-2 text-mono text-xs text-muted-foreground">
              Toggle
            </div>
            <div className="flex gap-2">
              <Toggle
                pressed={toggleOn}
                onPressedChange={setToggleOn}
                variant="outline"
                aria-label="Bold"
              >
                B
              </Toggle>
              <Toggle variant="outline" pressed disabled aria-label="Italic">
                I
              </Toggle>
            </div>
            <div className="mt-2">
              <ToggleGroup defaultValue={["left"]}>
                <ToggleGroupItem value="left">Left</ToggleGroupItem>
                <ToggleGroupItem value="center">Center</ToggleGroupItem>
                <ToggleGroupItem value="right">Right</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </Subsection>

      {/* Badges */}
      <Subsection title="Badges">
        <div className="flex flex-wrap gap-2">
          {STATUS_BADGE_VARIANTS.map(({ variant, label }) => (
            <StatusBadge
              key={variant}
              variant={variant}
              icon={<CheckIcon className="size-3" />}
            >
              {label}
            </StatusBadge>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="default">default</Badge>
          <Badge variant="primary">primary</Badge>
          <Badge variant="spotlight">spotlight</Badge>
          <Badge variant="success">success</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="destructive">destructive</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="agent">agent</Badge>
          <Badge variant="info">info</Badge>
        </div>
      </Subsection>

      {/* Alerts */}
      <Subsection title="Alerts">
        <div className="max-w-2xl space-y-3">
          {ALERT_VARIANTS.map(({ variant, icon, title, desc }) => (
            <Alert key={variant} variant={variant}>
              {icon}
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{desc}</AlertDescription>
            </Alert>
          ))}
        </div>
      </Subsection>

      {/* Empty / Item / Card */}
      <Subsection title="Empty state">
        <div className="max-w-sm rounded-lg border border-border">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageIcon strokeWidth={1.5} />
              </EmptyMedia>
              <EmptyTitle>No items yet</EmptyTitle>
              <EmptyDescription>
                Add your first inventory item to get started.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="default" size="sm">
              Add item
            </Button>
          </Empty>
        </div>
      </Subsection>

      <Subsection title="Item list">
        <div className="max-w-sm overflow-hidden rounded-lg border border-border">
          <ItemGroup>
            {[
              { title: "Jasmine Rice", desc: "Stock · 48 kg remaining" },
              { title: "Palm Oil", desc: "Stock · 12 L remaining" },
              { title: "Fish Sauce", desc: "Stock · 2 bottles remaining" },
            ].map((item) => (
              <Item key={item.title} variant="outline">
                <ItemMedia variant="icon">
                  <PackageIcon strokeWidth={1.5} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.desc}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </Subsection>

      {/* Tabs */}
      <Subsection title="Tabs">
        <Tabs defaultValue="overview" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-body text-muted-foreground">
              Overview content here.
            </p>
          </TabsContent>
          <TabsContent value="history">
            <p className="text-body text-muted-foreground">
              History content here.
            </p>
          </TabsContent>
          <TabsContent value="references">
            <p className="text-body text-muted-foreground">
              References content here.
            </p>
          </TabsContent>
        </Tabs>
      </Subsection>

      {/* Breadcrumb */}
      <Subsection title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Stock</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jasmine Rice</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Subsection>

      {/* Pagination */}
      <Subsection title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Subsection>

      {/* Tooltip / Popover / Dialog */}
      <Subsection title="Tooltip / Popover / Dialog">
        <div className="flex flex-wrap items-start gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="secondary" size="sm">
                    Hover for tooltip
                  </Button>
                }
              />
              <TooltipContent>This is a tooltip</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger
              render={
                <Button variant="secondary" size="sm">
                  Open popover
                </Button>
              }
            />
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Popover title</PopoverTitle>
              </PopoverHeader>
              <p className="text-small text-muted-foreground">
                Popover body content goes here. Use for contextual details.
              </p>
            </PopoverContent>
          </Popover>

          <Dialog>
            <DialogTrigger
              render={
                <Button variant="secondary" size="sm">
                  Open dialog
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  This dialog demonstrates the modal pattern. Confirm or cancel
                  below.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button variant="default" size="sm">
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Subsection>

      {/* Progress / Skeleton / Spinner */}
      <Subsection title="Progress / Skeleton / Spinner">
        <div className="max-w-sm space-y-4">
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              Progress at 50%
            </div>
            <Progress value={50} />
          </div>
          <div className="space-y-1">
            <div className="text-mono text-xs text-muted-foreground">
              Progress at 80%
            </div>
            <Progress value={80} />
          </div>
          <div className="space-y-2">
            <div className="text-mono text-xs text-muted-foreground">
              Skeleton
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-mono text-xs text-muted-foreground">
              Spinner
            </div>
            <Spinner />
            <Spinner className="size-6" />
            <Spinner className="size-8" />
          </div>
        </div>
      </Subsection>
    </section>
  );
}
