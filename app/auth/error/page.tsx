export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <h2 className="text-3xl font-bold text-red-600">Authentication Error</h2>
        <p className="text-gray-600">There was a problem signing you in. Please try again.</p>
        <a
          href="/auth/signin"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to sign in
        </a>
      </div>
    </div>
  );
}
