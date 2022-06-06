using System.IO.Abstractions;

namespace Bingo;

public static class Program
{
    public static async Task Main()
    {
        var fs = new FileSystem();
        var contents = await fs.File.ReadAllLinesAsync("2021-04.txt");

        var game = new Game(contents);

        var winner = game.PlayUntilWinner();
        var winningScore = winner.Score(game.CurrentBall);

        var loser = game.PlayUntilLoser();
        var losingScore = loser.Score(game.CurrentBall);

        Console.WriteLine($"{winningScore} / {losingScore}");
    }
}