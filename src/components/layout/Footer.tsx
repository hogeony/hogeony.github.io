export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} 디지털 자산 관리 플랫폼</p>
          <p className="text-sm mt-2">
            개인 디지털 자산을 체계적으로 관리하고 통찰을 도출합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
