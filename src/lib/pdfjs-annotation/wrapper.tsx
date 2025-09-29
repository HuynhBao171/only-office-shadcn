export class PdfjsAnnotationExtension {
  private initialized = false;

  constructor() {
    console.log("PdfjsAnnotationExtension wrapper created");
  }

  async initialize(): Promise<void> {
    try {
      console.log("Initializing PDF annotation extension...");
      this.initialized = true;
      console.log("PDF annotation extension initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PDF annotation extension:", error);
      throw error;
    }
  }

  exportAnnotations(): unknown[] {
    if (!this.initialized) {
      console.warn("Extension not initialized");
      return [];
    }
    // Return mock annotations for now
    return [];
  }

  saveAnnotations(): void {
    if (!this.initialized) {
      console.warn("Extension not initialized");
      return;
    }
    console.log("Saving annotations...");
  }

  hasUnsavedChanges(): boolean {
    return false;
  }

  destroy(): void {
    console.log("Destroying PDF annotation extension");
    this.initialized = false;
  }
}
