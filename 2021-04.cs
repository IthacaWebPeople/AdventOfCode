static async Task<string[]> GetInput()
    => await File.ReadAllLinesAsync("2021-04.txt");

static byte[] GetNumbers(string line)
    => line.Split(',')
        .Select(byte.Parse)
        .ToArray();

static byte[][][] GetBoards(string[] rows)
    => Enumerable.Range(0, (rows.Length + 1) / 6)
        .Select(i => rows[(i * 6)..(i * 6 + 5)]
            .Select(l => l.Split(' ')
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(n => byte.Parse(n.Trim()))
                .ToArray())
            .ToArray())
        .ToArray();

static bool HasWon(byte[][] board, byte[] called)
    => Enumerable.Range(0, 5)
        .Any(n => LineWins(board[n], called)
                  || LineWins(board.Select(r => r[n]).ToArray(), called));

static bool LineWins(byte[] row, byte[] called)
    => row.All(called.Contains);

static int GetScore(byte[][] board, byte[] numbers, int round)
    => board.Sum(row => row.Sum(n => !numbers[..(round + 1)].Contains(n) ? n : 0)) * numbers[round];

static int GetWinningScore(byte[] numbers, byte[][][] boards)
{
    byte[][]? winner = null;
    byte round = 5;
    while (winner == null && round++ < numbers.Length)
    {
        var currentRound = round;
        winner = boards.FirstOrDefault(board => HasWon(board, numbers[..(currentRound + 1)]));
    }

    return winner != null
        ? GetScore(winner, numbers, round)
        : 0;
}

static int GetLosingScore(byte[] numbers, byte[][][] boards)
{
    byte[][]? loser = null;
    var round = numbers.Length;
    while (loser == null && round-- >= 0)
    {
        var currentRound = round;
        loser = boards.FirstOrDefault(board => !HasWon(board, numbers[..(currentRound + 1)]));
    }

    return loser != null
        ? GetScore(loser, numbers, round + 1)
        : 0;
}

var lines = await GetInput();
var numbers = GetNumbers(lines[0]);
var boards = GetBoards(lines[2..]);
var winningScore = GetWinningScore(numbers, boards);
var losingScore = GetLosingScore(numbers, boards);
Console.WriteLine($"{winningScore} / {losingScore}");