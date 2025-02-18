import { createRoot } from 'react-dom/client';
import App from './App';

// 1. Получаем root-элемент с проверкой
const rootElement = document.getElementById('root');

// 2. Явная проверка существования элемента
if (!rootElement) {
    throw new Error('Failed to find the root element');
}

// 3. Создаем корневой элемент
const root = createRoot(rootElement);

// 4. Рендерим приложение
root.render(<App />);