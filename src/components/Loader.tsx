import { Flex, Spinner } from "@radix-ui/themes";

const Loader = () => {
  return (
    <Flex
      justify="center"
      align="center"
      style={{ height: "100vh", width: "100vw" }}
    >
      <Spinner size="3" />
    </Flex>
  );
};

export default Loader;
