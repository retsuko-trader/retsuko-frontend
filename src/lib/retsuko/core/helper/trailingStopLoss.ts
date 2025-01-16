import { Serializable } from '../serializable';

export class TrailingStopLoss implements Serializable {
  $percentage = 0;
  $prevPrice = 0;
  $stopLoss = 0;
  $isActive = false;

  constructor(percentage: number) {
    this.$percentage = percentage;
  }

  public create(percentage: number, price: number) {
    this.$percentage = (100 - percentage) / 100;
    this.$prevPrice = price;
    this.$stopLoss = this.$percentage * price;
    this.$isActive = true;
  }

  public destroy() {
    this.$percentage = 0;
    this.$prevPrice = 0;
    this.$stopLoss = 0;
    this.$isActive = false;
  }

  public isTriggered(price: number) {
    if (!this.$isActive) {
      return false;
    }

    return this.$stopLoss > price;
  }

  public serialize(): string {
    return JSON.stringify({
      percentage: this.$percentage,
      prevPrice: this.$prevPrice,
      stopLoss: this.$stopLoss,
      isActive: this.$isActive,
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.$percentage = parsed.percentage;
    this.$prevPrice = parsed.prevPrice;
    this.$stopLoss = parsed.stopLoss;
    this.$isActive = parsed.isActive;
  }
}