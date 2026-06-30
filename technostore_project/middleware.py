import sys
import traceback
from django.http import HttpResponse

class ExceptionDisplayMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        exc_type, exc_value, exc_traceback = sys.exc_info()
        tb_lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
        tb_text = "".join(tb_lines)
        
        html = f"""
        <html>
        <head><title>Debug Exception Traceback</title></head>
        <body style="font-family: monospace; padding: 20px; background: #fdf2f2; color: #9b1c1c; line-height: 1.5;">
            <h1>500 Internal Server Error (Captured by Debug Middleware)</h1>
            <h2>{exc_type.__name__ if exc_type else "Exception"}: {exc_value}</h2>
            <pre style="background: #fff; padding: 15px; border: 1px solid #f8b4b4; border-radius: 4px; overflow: auto; white-space: pre-wrap;">{tb_text}</pre>
        </body>
        </html>
        """
        return HttpResponse(html, status=500)
