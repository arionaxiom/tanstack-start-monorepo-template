import {
  DirectionProvider as BaseDirectionProvider,
  type DirectionProviderProps,
  useDirection as useBaseDirection,
} from "@base-ui/react/direction-provider";

function DirectionProvider(props: DirectionProviderProps) {
  return <BaseDirectionProvider {...props} />;
}

function useDirection() {
  return useBaseDirection();
}

export { DirectionProvider, useDirection };
