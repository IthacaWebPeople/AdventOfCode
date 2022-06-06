namespace Bingo;

public class Game
{
    private Cage _cage { get; }
    private Player[] _players { get; }

    public Ball CurrentBall { get; private set; } = null!;

    public Game(string[] contents)
    {
        var balls = contents[0];
        _cage = new Cage(balls);

        var lines = contents[2..];
        _players = Enumerable.Range(0, (lines.Length + 1) / 6)
            .Select(i => lines[(i * 6)..(i * 6 + 5)])
            .Select(numbers => new Card(numbers))
            .Select(card => new Player(card))
            .ToArray();
    }

    public Player PlayUntilWinner()
    {
        while (!_players.Any(player => player.Won()))
        {
            PlayRound();
        }

        return _players.Single(player => player.Won());
    }

    public Player PlayUntilLoser()
    {
        while (_players.Count(player => !player.Won()) > 1)
        {
            PlayRound();
        }

        var loser = _players.Single(player => !player.Won());
        while (!loser.Won())
        {
            PlayRound();
        }

        return loser;
    }

    private void PlayRound()
    {
        CurrentBall = _cage.Next();
        foreach (var player in _players)
        {
            player.MarkCard(CurrentBall);
        }
    }
}