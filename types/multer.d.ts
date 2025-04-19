declare module 'multer' {
  import { Request } from 'express';
  
  namespace multer {
    interface File {
      /** Field name specified in the form */
      fieldname: string;
      /** Name of the file on the user's computer */
      originalname: string;
      /** Encoding type of the file */
      encoding: string;
      /** Mime type of the file */
      mimetype: string;
      /** Size of the file in bytes */
      size: number;
      /** The folder to which the file has been saved (DiskStorage) */
      destination?: string;
      /** The name of the file within the destination (DiskStorage) */
      filename?: string;
      /** Location of the uploaded file (DiskStorage) */
      path?: string;
      /** A Buffer of the entire file (MemoryStorage) */
      buffer?: Buffer;
    }
    
    interface FileFilterCallback {
      (error: Error | null, acceptFile: boolean): void;
    }
    
    interface StorageEngine {
      _handleFile(
        req: Request,
        file: Express.Multer.File,
        callback: (error?: any, info?: Partial<File>) => void
      ): void;
      _removeFile(
        req: Request,
        file: Express.Multer.File,
        callback: (error?: any) => void
      ): void;
    }
    
    interface MulterOptions {
      /** The destination directory for uploaded files */
      dest?: string;
      /** The storage engine to use */
      storage?: StorageEngine;
      /** An object specifying the size limits */
      limits?: {
        /** Max file size in bytes */
        fileSize?: number;
        /** Max number of files */
        files?: number;
        /** Max field name size */
        fieldNameSize?: number;
        /** Max field value size */
        fieldSize?: number;
        /** Max number of fields */
        fields?: number;
        /** Max number of parts */
        parts?: number;
        /** Max number of headers */
        headerPairs?: number;
      };
      /** A function to control which files are uploaded */
      fileFilter?(
        req: Request,
        file: File,
        callback: FileFilterCallback
      ): void;
      /** A function to rename the uploaded files */
      filename?(
        req: Request,
        file: File,
        callback: (error: Error | null, filename: string) => void
      ): void;
    }
    
    interface DiskStorageOptions {
      /** A function that determines the destination path for uploaded files */
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      /** A function that determines the name of the uploaded file */
      filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
    }
    
    interface MemoryStorageOptions {}
    
    interface Multer {
      /** Accept a single file with the name fieldname. */
      single(fieldname: string): any;
      /** Accept an array of files, all with the name fieldname. */
      array(fieldname: string, maxCount?: number): any;
      /** Accept a mix of files, specified by fields. */
      fields(fields: { name: string; maxCount?: number }[]): any;
      /** Accept only text fields. */
      none(): any;
      /** Handle all uploads at once, and pass them to your middleware as req.files */
      any(): any;
    }
    
    function diskStorage(options: DiskStorageOptions): StorageEngine;
    function memoryStorage(options?: MemoryStorageOptions): StorageEngine;
  }
  
  function multer(options?: multer.MulterOptions): multer.Multer;
  
  export = multer;
}