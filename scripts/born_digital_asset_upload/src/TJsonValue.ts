type TJsonValue = string | number | bigint | boolean | null | { [x: string]: TJsonValue } | Array<TJsonValue>;

export default TJsonValue;
