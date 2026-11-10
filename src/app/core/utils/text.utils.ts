export function pluralize(count: number, singular: string, plural: string): string {
  const label = `${count} ${count === 1 ? singular : plural}`;

  return label;
}
