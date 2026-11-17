namespace starter_code;

public static class Initialiser
{
    public static void Start()
    {
        try
        {
            Tracker.track(GetDir());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Tracker failed: {ex.Message}");
        }
    }

    public static void Stop()
    {
        try
        {
            var report = Tracker.output(GetDir());
            if (!string.IsNullOrWhiteSpace(report)) WriteLog(report);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Tracker failed: {ex.Message}");
        }
    }

    public static string GetDir(string fileName = "AyventDb.db")
    {
        return Path.Combine(GetDir(), fileName);
    }

    public static string GetDir()
    {
        var dir = Directory.GetParent(AppContext.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
        dir = dir ?? Directory.GetCurrentDirectory();
        return dir;
    }

    private static void WriteLog(string text)
    {
        File.AppendAllText(Path.Combine(GetDir(), "runlog.txt"), text + Environment.NewLine);
    }
}