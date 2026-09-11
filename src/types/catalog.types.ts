export interface CreateBrandData {
  name: string;
  description?: string;
  logo?: Express.Multer.File;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
}
