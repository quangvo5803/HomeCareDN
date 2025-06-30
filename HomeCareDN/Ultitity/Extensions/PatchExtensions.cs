using System.Reflection;

namespace Ultitity.Extensions
{
    public static class PatchExtensions
    {
        public static void PatchFrom<TSource, TDestination>(this TDestination dest, TSource source)
        {
            var sourceProps = typeof(TSource).GetProperties(
                BindingFlags.Public | BindingFlags.Instance
            );
            var destProps = typeof(TDestination).GetProperties(
                BindingFlags.Public | BindingFlags.Instance
            );

            foreach (var sourceProp in sourceProps)
            {
                var destProp = destProps.FirstOrDefault(p =>
                    p.Name == sourceProp.Name && p.CanWrite
                );

                if (destProp == null)
                    continue;

                var value = sourceProp.GetValue(source);

                // Nếu giá trị là null thì bỏ qua
                if (value == null)
                    continue;

                // Nếu kiểu dữ liệu không assignable thì bỏ qua
                if (!destProp.PropertyType.IsAssignableFrom(sourceProp.PropertyType))
                    continue;

                destProp.SetValue(dest, value);
            }
        }
    }
}
