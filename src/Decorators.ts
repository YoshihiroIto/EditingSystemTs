export class EditingSystem {
  static ignoreName = 'EditingSystem_ignore';

  static ignore(target: unknown, propertyName: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = target as any;

    let ignoreUndoProperties = t[EditingSystem.ignoreName] as Set<string>;

    if (ignoreUndoProperties == null) {
      ignoreUndoProperties = new Set<string>();

      t[EditingSystem.ignoreName] = ignoreUndoProperties;
    }

    ignoreUndoProperties.add(propertyName);
  }
}
