export async function compressImage(file: File): Promise<string> {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = (event) => {
 const img = new Image();
 img.onload = () => {
 const canvas = document.createElement('canvas');
 const MAX_WIDTH = 1024;
 const MAX_HEIGHT = 1024;
 let width = img.width;
 let height = img.height;

 if (width > height) {
 if (width > MAX_WIDTH) {
 height *= MAX_WIDTH / width;
 width = MAX_WIDTH;
 }
 } else {
 if (height > MAX_HEIGHT) {
 width *= MAX_HEIGHT / height;
 height = MAX_HEIGHT;
 }
 }

 canvas.width = width;
 canvas.height = height;
 const ctx = canvas.getContext('2d');
 if (!ctx) {
 resolve(event.target?.result as string); // Fallback
 return;
 }
 ctx.drawImage(img, 0, 0, width, height);
 resolve(canvas.toDataURL('image/jpeg', 0.7)); // Aggressive 0.7 quality for receipt archiving
 };
 img.onerror = reject;
 img.src = event.target?.result as string;
 };
 reader.onerror = reject;
 reader.readAsDataURL(file);
 });
}
