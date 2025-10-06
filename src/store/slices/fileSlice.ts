import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  order: number;
}

export interface ProcessedFile {
  id: string;
  originalFiles: UploadedFile[];
  combinedContent: string;
  minifiedContent: string;
  originalSize: number;
  minifiedSize: number;
  compressionRatio: number;
  timestamp: string;
}

interface FileState {
  uploadedFiles: UploadedFile[];
  processedFiles: ProcessedFile[];
  isLoading: boolean;
  error: string | null;
  activeTab: 'js' | 'css';
}

const initialState: FileState = {
  uploadedFiles: [],
  processedFiles: [],
  isLoading: false,
  error: null,
  activeTab: 'js',
};

// Async thunks
export const uploadFiles = createAsyncThunk(
  'files/uploadFiles',
  async (files: FileList) => {
    const uploadedFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      
      uploadedFiles.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        content,
        order: i,
      });
    }
    
    return uploadedFiles;
  }
);

export const processFiles = createAsyncThunk(
  'files/processFiles',
  async (payload: { files: UploadedFile[]; sessionId?: string; userLocation?: any }): Promise<ProcessedFile> => {
    const result = await apiService.processFiles(payload.files, payload.sessionId, payload.userLocation);
    return result as ProcessedFile;
  }
);

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'js' | 'css'>) => {
      state.activeTab = action.payload;
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.uploadedFiles = state.uploadedFiles.filter(
        file => file.id !== action.payload
      );
    },
    reorderFiles: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const file = state.uploadedFiles[fromIndex];
      state.uploadedFiles.splice(fromIndex, 1);
      state.uploadedFiles.splice(toIndex, 0, file);
      
      // Update order property
      state.uploadedFiles.forEach((file, index) => {
        file.order = index;
      });
    },
    clearFiles: (state) => {
      state.uploadedFiles = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadedFiles = action.payload;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to upload files';
      })
      .addCase(processFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.processedFiles.unshift(action.payload);
      })
      .addCase(processFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to process files';
      });
  },
});

export const { setActiveTab, removeFile, reorderFiles, clearFiles, clearError } = fileSlice.actions;
export default fileSlice.reducer;
