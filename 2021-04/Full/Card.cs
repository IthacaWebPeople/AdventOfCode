namespace Bingo;

public class Card
{
    public Square[][] Squares { get; }

    private Square[][] Rows
        => Squares;

    private Square[][] Columns
        => Enumerable.Range(0, 5).Select(n => Squares.Select(row => row[n]).ToArray()).ToArray();

    public Card(string[] numbers)
        => Squares = numbers.Select(l => l.Split(' ')
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(n => new Square(byte.Parse(n.Trim())))
                .ToArray())
            .ToArray();

    public bool HasFullRow()
        => Rows.Any(row => row.All(square => square.Marked));

    public bool HasFullColumn()
        => Columns.Any(col => col.All(square => square.Marked));

    public bool Has(byte value)
        => Squares.Any(row => row.Any(square => square.Value == value));

    public void Mark(byte value)
        => Squares.SelectMany(row => row)
            .Single(square => square.Value == value)
            .Mark();
}