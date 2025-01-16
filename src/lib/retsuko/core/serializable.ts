export interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}