namespace Bingo;

public class Player
{
    private Card _card { get; }

    public Player(Card card)
        => _card = card;

    public bool Won()
        => _card.HasFullRow()
           || _card.HasFullColumn();

    public int Score(Ball current)
        => _card.Squares.Sum(row => row.Where(square => !square.Marked).Sum(square => square.Value)) * current.Value;

    public void MarkCard(Ball current)
    {
        if (_card.Has(current.Value))
        {
            _card.Mark(current.Value);
        }
    }
}