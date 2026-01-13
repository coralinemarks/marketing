export type ScenarioConfig = {
  /**
   * Budget adjustment in dollars per month.
   * Can be negative or positive.
   */
  budgetDelta: number;
  /**
   * Optional extra channel to add (e.g. "SEO").
   * Stored as plain text.
   */
  addChannel: string;
};

