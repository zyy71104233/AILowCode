// // FileUpload.tsx
// import React from 'react';

// interface FileUploadProps {
//   onFileUpload: (file: File) => void;
//   accept?: string;
//   label?: string;
//   className?: string;
// }

// const FileUpload: React.FC<FileUploadProps> = ({ 
//   onFileUpload, 
//   accept = '', 
//   label = '上传文件',
//   className = ''
// }) => {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       onFileUpload(e.target.files[0]);
//     }
//   };

//   return (
//     <div className={`file-upload ${className}`}>
//       <label className="upload-button">
//         {label}
//         <input
//           type="file"
//           accept={accept}
//           onChange={handleChange}
//           style={{ display: 'none' }}
//         />
//       </label>
//     </div>
//   );
// };

// export default FileUpload;

// FileUpload.tsx
import React from 'react';
// 在 FileUpload.tsx 顶部添加导入
import { Role } from '../types/types'; // 根据实际路径调整

interface FileUploadProps {
  onFileUpload: (files: FileInfo[]) => void;
  accept?: string;
  label?: string;
  className?: string;
  role?: Role;  // 添加角色属性
  uploadType: 'document' | 'folder'; // 明确上传类型
}

interface FileInfo {
  name: string;
  path: string;
  content: string;
}

interface FileUploadProps {
  onFileUpload: (files: FileInfo[]) => void;
  accept?: string;
  label?: string;
  className?: string;
  role?: Role;  // 添加角色属性
  uploadType: 'document' | 'folder'; // 明确上传类型
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  accept = '', 
  label = '上传文件',
  className = '',
  role,
  uploadType
}) => {
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error(`文件读取失败: ${file.name}`));
      reader.readAsText(file);
    });
  };

  const handleFileOrDirectoryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const fileInfos = await Promise.all(
        Array.from(files).map(async (file) => ({
          name: file.name,
          path: (file as any).webkitRelativePath || file.name,
          content: await readFileContent(file)
        }))
      );
      
      onFileUpload(fileInfos);
    } catch (error) {
      console.error('文件处理错误:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileOrDirectoryUpload(e.target.files);
    e.target.value = '';
  };

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileOrDirectoryUpload(e.target.files);
    e.target.value = '';
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* 根据上传类型显示不同按钮 */}
      {uploadType === 'document' ? (
        <label className="upload-button">
          {label}
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      ) : (
        <label className="upload-button">
          上传最新版本代码
          <input
            type="file"
            accept={accept}
            onChange={handleDirectoryChange}
            style={{ display: 'none' }}
            // @ts-ignore
            webkitdirectory=""
            mozdirectory=""
            directory=""
            multiple
          />
        </label>
      )}
    </div>
  );
};

export default FileUpload;