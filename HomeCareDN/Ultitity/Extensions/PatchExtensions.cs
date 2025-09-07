using System.Reflection;

namespace Ultitity.Extensions
{
    using System.Reflection;

    public static class PatchExtensions
    {
        public static void PatchFrom<TSource, TDestination>(
            this TDestination dest,
            TSource source,
            params string[] ignoreProperties
        )
        {
            var sourceProps = typeof(TSource).GetProperties(
                BindingFlags.Public | BindingFlags.Instance
            );
            var destProps = typeof(TDestination).GetProperties(
                BindingFlags.Public | BindingFlags.Instance
            );

            foreach (var sourceProp in sourceProps)
            {
                if (ignoreProperties.Contains(sourceProp.Name))
                    continue;

                var destProp = destProps.FirstOrDefault(p =>
                    p.Name == sourceProp.Name && p.CanWrite
                );
                if (destProp == null)
                    continue;

                var value = sourceProp.GetValue(source);

                try
                {
                    if (destProp.PropertyType.IsAssignableFrom(sourceProp.PropertyType))
                    {
                        destProp.SetValue(dest, value);
                    }
                    else
                    {
                        var targetType =
                            Nullable.GetUnderlyingType(destProp.PropertyType)
                            ?? destProp.PropertyType;

                        var convertedValue = Convert.ChangeType(value, targetType);
                        destProp.SetValue(dest, convertedValue);
                    }
                }
                catch
                {
                    // log nếu muốn
                }
            }
        }
    }

}
