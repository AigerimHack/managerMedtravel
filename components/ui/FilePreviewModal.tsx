'use client'
import { Download } from 'lucide-react'
import { Modal } from './Modal'

interface Props {
  open: boolean
  onClose: () => void
  fileName?: string
  fileData?: string
  fileType?: string
}

export function FilePreviewModal({ open, onClose, fileName, fileData }: Props) {
  const isPdf = fileData?.startsWith('data:application/pdf') || fileName?.toLowerCase().endsWith('.pdf')
  const isImg = fileData?.match(/^data:image\//)

  return (
    <Modal open={open} onClose={onClose} wide
      title={fileName ?? 'Просмотр файла'}
      footer={
        fileData && (
          <a href={fileData} download={fileName}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-teal-600 hover:bg-teal-50 transition-colors">
            <Download size={14} /> Скачать
          </a>
        )
      }>
      <div className="min-h-80 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden -mx-1">
        {isPdf && fileData ? (
          <iframe src={fileData} className="w-full h-[600px] border-none" />
        ) : isImg && fileData ? (
          <span style={{ display: 'contents' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fileData} alt={fileName} className="max-w-full max-h-[600px] object-contain p-4" />
          </span>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs mt-2">Этот тип файла нельзя предварительно просмотреть. Скачайте для просмотра.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
